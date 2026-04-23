import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { createServiceClient } from "../../../../../lib/supabase/server";
import {
  createRecurringPlanCheckoutSession,
  cancelStripeSubscription,
} from "../../../../../lib/stripe/api";
import { sendEmail } from "../../../../../lib/email/send";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET — fetch active plan for this customer ─────────────────────────────────
export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: plan } = await supabase
    .from("recurring_plans")
    .select("*")
    .eq("customer_id", id)
    .eq("user_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ plan: plan ?? null });
}

// ── POST — create a new recurring plan ───────────────────────────────────────
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { planName, amountDollars } = body;

  if (!planName?.trim()) {
    return NextResponse.json({ error: "Plan name is required." }, { status: 400 });
  }
  const amount = parseFloat(amountDollars);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than $0." }, { status: 400 });
  }

  const supabaseService = createServiceClient();

  // Fetch customer + settings in parallel
  const [{ data: customer }, { data: settings }] = await Promise.all([
    supabase.from("customers").select("id, name, email").eq("id", id).single(),
    supabase
      .from("settings")
      .select("business_name, business_email, business_phone, stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  if (!customer.email) {
    return NextResponse.json(
      { error: "Customer needs an email address to set up recurring billing." },
      { status: 422 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const businessName = settings?.business_name ?? "YardPilot";
  const businessEmail = settings?.business_email ?? "";
  const connectedAccountId = settings?.stripe_account_id ?? undefined;
  const amountCents = Math.round(amount * 100);

  // Create the Stripe Checkout session
  let checkoutSession: { id: string; url: string };
  try {
    checkoutSession = await createRecurringPlanCheckoutSession({
      planName: planName.trim(),
      amountCents,
      interval: "month",
      customerEmail: customer.email,
      customerName: customer.name,
      successUrl: `${appUrl}/customers/${id}?plan=activated`,
      cancelUrl: `${appUrl}/customers/${id}`,
      connectedAccountId,
      metadata: {
        crm_customer_id: customer.id,
        crm_user_id: user.id,
        plan_name_label: planName.trim(),
      },
    });
  } catch (err) {
    console.error("Recurring plan checkout error:", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Stripe checkout failed." },
      { status: 500 }
    );
  }

  // Store the pending plan record
  const { data: plan, error: insertError } = await supabaseService
    .from("recurring_plans")
    .insert({
      user_id: user.id,
      customer_id: customer.id,
      plan_name: planName.trim(),
      amount_cents: amountCents,
      interval: "month",
      status: "pending",
      stripe_checkout_session_id: checkoutSession.id,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Email the customer their payment setup link
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#059669;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">YardPilot</p>
          </td>
        </tr>
        <tr><td style="padding:32px 32px 8px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Set up your recurring service plan</p>
          <p style="margin:0;font-size:15px;color:#475569;">
            Hi ${customer.name}, ${businessName} has set up a <strong>${planName.trim()}</strong> plan for you at <strong>$${amount.toFixed(2)}/month</strong>.
          </p>
          <p style="margin:12px 0 0;font-size:15px;color:#475569;">
            Click below to enter your payment details. Once set up, you'll be charged automatically every month — no hassle.
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <a href="${checkoutSession.url}" style="display:inline-block;background:#059669;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
            Set Up Automatic Payments
          </a>
        </td></tr>
        <tr><td style="padding:0 32px 32px;font-size:13px;color:#64748b;">
          <p style="margin:0;">Your card is securely stored by Stripe. You can cancel at any time by contacting ${businessName}.</p>
          ${businessEmail ? `<p style="margin:8px 0 0;">Questions? <a href="mailto:${businessEmail}" style="color:#059669;">${businessEmail}</a>${settings?.business_phone ? ` · ${settings.business_phone}` : ""}.</p>` : ""}
        </td></tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              Secure payments powered by Stripe · YardPilot
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to: customer.email,
    fromName: businessName,
    subject: `Set up your ${planName.trim()} plan with ${businessName}`,
    html,
    replyTo: businessEmail || undefined,
  }).catch((err) => console.error("Recurring plan email error:", err));

  return NextResponse.json({ ok: true, plan, checkoutUrl: checkoutSession.url });
}

// ── DELETE — cancel the active plan ──────────────────────────────────────────
export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: plan } = await supabase
    .from("recurring_plans")
    .select("id, stripe_subscription_id, status")
    .eq("customer_id", id)
    .eq("user_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) return NextResponse.json({ error: "No active plan found." }, { status: 404 });

  // Cancel in Stripe if we have a subscription ID
  if (plan.stripe_subscription_id) {
    try {
      await cancelStripeSubscription(plan.stripe_subscription_id);
    } catch (err) {
      console.error("Cancel Stripe subscription error:", err);
      // Continue — still mark cancelled in DB
    }
  }

  await supabase
    .from("recurring_plans")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", plan.id);

  return NextResponse.json({ ok: true });
}
