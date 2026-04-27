import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { verifyWebhookSignature } from "../../../../lib/stripe/api";
import { buildInvoiceEmailData } from "../../../../lib/email/invoice-email-data";
import { invoicePaidEmail } from "../../../../lib/email/templates";
import { sendEmail } from "../../../../lib/email/send";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (webhookSecret) {
    const valid = await verifyWebhookSignature(payload, signature, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── Invoice payment (one-time) ──────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const mode = session.mode as string;

    if (mode === "payment") {
      // One-time invoice payment
      const invoiceId = (session.metadata as Record<string, string>)?.invoice_id;
      const paymentStatus = session.payment_status as string;

      if (invoiceId && paymentStatus === "paid") {
        const metadata = (session.metadata as Record<string, string>) ?? {};
        const tipAmountCents = parseInt(metadata.tip_amount_cents ?? "0", 10);
        const tipAmount = tipAmountCents > 0 ? tipAmountCents / 100 : null;

        const { data: invoice, error } = await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_session_id: session.id as string,
            ...(tipAmount !== null ? { tip_amount: tipAmount } : {}),
          })
          .eq("id", invoiceId)
          .select()
          .single();

        if (error) {
          console.error("Webhook: failed to update invoice", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (invoice) {
          buildInvoiceEmailData(supabase, invoiceId)
            .then(async (emailData) => {
              if (!emailData?.customerEmail) return;
              const html = invoicePaidEmail(emailData);
              await sendEmail({
                to: emailData.customerEmail,
                subject: `Payment received — Invoice ${emailData.invoiceNumber}`,
                html,
                fromName: emailData.businessName,
                replyTo: emailData.businessEmail || undefined,
              });
            })
            .catch((err) => console.error("Webhook: email send failed", err));
        }
      }
    }

    if (mode === "subscription") {
      const metadata = (session.metadata as Record<string, string>) ?? {};
      const crmCustomerId = metadata.crm_customer_id;

      if (crmCustomerId) {
        // ── Customer recurring plan checkout completed — activate it ──
        const subscriptionId = session.subscription as string;
        await supabase
          .from("recurring_plans")
          .update({
            status: "active",
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_checkout_session_id", session.id as string);
      } else {
        // ── YardPilot operator plan signup — auto-invite the user ──
        const customerEmail = session.customer_email as string;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const planName = metadata.plan_name ?? "basic";
        const fullName = metadata.full_name ?? "";
        const businessName = metadata.business_name ?? "";

        if (!customerEmail) {
          return NextResponse.json({ received: true });
        }

        const { data: inviteData, error: inviteError } =
          await supabase.auth.admin.inviteUserByEmail(customerEmail, {
            data: { full_name: fullName },
          });

        if (inviteError && !inviteError.message.includes("already registered")) {
          console.error("Webhook: failed to invite user", inviteError);
          return NextResponse.json({ error: inviteError.message }, { status: 500 });
        }

        let userId = inviteData?.user?.id;
        if (!userId) {
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existing = existingUsers?.users?.find(
            (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
          );
          userId = existing?.id;
        }

        if (userId) {
          await supabase.from("settings").upsert(
            {
              user_id: userId,
              business_name: businessName || null,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: "trialing",
              plan_name: planName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        }
      }
    }
  }

  // ── Recurring plan payment succeeded → auto-create invoice ────────────────
  if (event.type === "invoice.paid") {
    const inv = event.data.object;
    const subscriptionId = inv.subscription as string | null;
    const billingReason = inv.billing_reason as string | null;

    // Only handle subscription invoices (not the first setup invoice if $0)
    if (subscriptionId && billingReason === "subscription_cycle") {
      const amountPaid = inv.amount_paid as number; // in cents
      if (amountPaid > 0) {
        // Look up our recurring plan by subscription ID
        const { data: planRow } = await supabase
          .from("recurring_plans")
          .select("id, user_id, customer_id, plan_name, amount_cents")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (planRow) {
          // Keep plan status current
          const periodEnd = (inv.period_end as number | null);
          await supabase
            .from("recurring_plans")
            .update({
              status: "active",
              next_billing_date: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", planRow.id);

          // Auto-create a paid invoice in the CRM
          const now = new Date();
          const { data: newInvoice } = await supabase
            .from("invoices")
            .insert({
              user_id: planRow.user_id,
              customer_id: planRow.customer_id,
              title: planRow.plan_name,
              amount: planRow.amount_cents / 100,
              status: "paid",
              paid_at: now.toISOString(),
              created_at: now.toISOString(),
              source: "recurring",
              notes: `Auto-generated from recurring plan · Stripe subscription ${subscriptionId}`,
            })
            .select()
            .single();

          // Send paid confirmation email to customer
          if (newInvoice) {
            buildInvoiceEmailData(supabase, newInvoice.id, planRow.user_id)
              .then(async (emailData) => {
                if (!emailData?.customerEmail) return;
                const html = invoicePaidEmail(emailData);
                await sendEmail({
                  to: emailData.customerEmail,
                  subject: `Payment received — ${emailData.invoiceNumber}`,
                  html,
                  fromName: emailData.businessName,
                  replyTo: emailData.businessEmail || undefined,
                });
              })
              .catch((err) => console.error("Recurring invoice email error:", err));
          }
        }
      }
    }

    // Mark plan past_due if subscription invoice fails (handled below)
  }

  // ── Recurring plan payment failed ─────────────────────────────────────────
  if (event.type === "invoice.payment_failed") {
    const inv = event.data.object;
    const subscriptionId = inv.subscription as string | null;
    if (subscriptionId) {
      await supabase
        .from("recurring_plans")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscriptionId);
    }
  }

  // ── Subscription status changes ─────────────────────────────────────────────
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object;
    const subscriptionId = sub.id as string;
    const status = sub.status as string;
    const currentPeriodEnd = sub.current_period_end as number;
    const trialEnd = sub.trial_end as number | null;

    await supabase
      .from("settings")
      .update({
        subscription_status: status,
        current_period_end: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        trial_ends_at: trialEnd
          ? new Date(trialEnd * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);
  }

  return NextResponse.json({ received: true });
}
