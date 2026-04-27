import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../../lib/supabase/server";
import { validatePortalToken } from "../../../../../lib/portal-token";
import { createCheckoutSession } from "../../../../../lib/stripe/api";
import { getPlanConfig } from "../../../../../lib/plans";

type RouteContext = { params: Promise<{ token: string }> };

/**
 * POST /api/portal/[token]/checkout
 *
 * Creates a Stripe Checkout Session for a customer paying an invoice
 * through the customer portal. Authenticated via portal token (no login required).
 *
 * Body: { invoiceId: string, tipAmountCents?: number }
 */
export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;

  // ── Validate portal token ────────────────────────────────────────────────────
  const valid = await validatePortalToken(token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 401 });
  }

  const { customerId, userId: ownerId } = valid;

  let body: { invoiceId?: string; tipAmountCents?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { invoiceId, tipAmountCents = 0 } = body;
  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId is required." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── Fetch invoice — must belong to this customer ────────────────────────────
  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .select("id, title, amount, status")
    .eq("id", invoiceId)
    .eq("customer_id", customerId)
    .single();

  if (invError || !invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (invoice.status === "paid") {
    return NextResponse.json({ error: "Invoice is already paid." }, { status: 400 });
  }

  // ── Fetch owner settings ─────────────────────────────────────────────────────
  const { data: settings } = await supabase
    .from("settings")
    .select("stripe_account_id, plan_name, business_email")
    .eq("user_id", ownerId)
    .maybeSingle();

  const connectedAccountId = settings?.stripe_account_id ?? undefined;
  const planConfig = getPlanConfig(settings?.plan_name);

  // Tips only allowed on Pro/Premier — ignore any tip on Basic
  const safeTipCents = planConfig.tips ? Math.max(0, Math.round(tipAmountCents)) : 0;

  // ── Fetch customer email for Stripe pre-fill ─────────────────────────────────
  const { data: customer } = await supabase
    .from("customers")
    .select("name, email")
    .eq("id", customerId)
    .maybeSingle();

  const platformFeePercent = parseFloat(
    process.env.STRIPE_PLATFORM_FEE_PERCENT ?? "0"
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const amountCents = Math.round(Number(invoice.amount) * 100);

  try {
    const session = await createCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.title ?? `Invoice ${invoice.id.slice(0, 8)}`,
      amountCents,
      tipAmountCents: safeTipCents,
      customerEmail: customer?.email ?? undefined,
      customerName: customer?.name ?? undefined,
      description: "Lawn care services — YardPilot",
      successUrl: `${appUrl}/payment-success?invoice=${invoice.id}`,
      cancelUrl: `${appUrl}/portal/${token}`,
      connectedAccountId,
      platformFeePercent,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
