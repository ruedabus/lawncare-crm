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
        const { data: invoice, error } = await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_session_id: session.id as string,
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
      // New subscription — auto-invite the user
      const customerEmail = session.customer_email as string;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const metadata = (session.metadata as Record<string, string>) ?? {};
      const planName = metadata.plan_name ?? "basic";
      const fullName = metadata.full_name ?? "";
      const businessName = metadata.business_name ?? "";

      if (!customerEmail) {
        return NextResponse.json({ received: true });
      }

      // Invite user via Supabase (creates account + sends set-password email)
      const { data: inviteData, error: inviteError } =
        await supabase.auth.admin.inviteUserByEmail(customerEmail, {
          data: { full_name: fullName },
        });

      if (inviteError && !inviteError.message.includes("already registered")) {
        console.error("Webhook: failed to invite user", inviteError);
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
      }

      // Upsert settings row with subscription details
      const userId = inviteData?.user?.id;
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
