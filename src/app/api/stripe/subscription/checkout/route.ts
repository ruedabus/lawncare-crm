import { NextResponse } from "next/server";
import { createSubscriptionCheckoutSession } from "../../../../../lib/stripe/api";

const PRICE_MAP: Record<string, string | undefined> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  premier: process.env.STRIPE_PREMIER_PRICE_ID,
};

export async function POST(request: Request) {
  try {
    const { plan, email, name, businessName, coupon } = await request.json();

    if (!plan || !email) {
      return NextResponse.json({ error: "plan and email are required" }, { status: 400 });
    }

    const priceId = PRICE_MAP[plan as string];
    if (!priceId) {
      return NextResponse.json(
        { error: `No price configured for plan: ${plan}. Set STRIPE_${String(plan).toUpperCase()}_PRICE_ID in your environment.` },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.yardpilot.net";
    const trialDays = parseInt(process.env.STRIPE_TRIAL_DAYS ?? "14", 10);

    const session = await createSubscriptionCheckoutSession({
      priceId,
      customerEmail: email,
      trialDays,
      coupon: coupon ?? undefined,
      successUrl: `${appUrl}/trial-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/start-trial`,
      metadata: {
        plan_name: plan,
        full_name: name ?? "",
        business_name: businessName ?? "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
