import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createBillingPortalSession } from "../../../../lib/stripe/api";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: settings } = await supabase
    .from("settings")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerId = settings?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
  }

  const returnUrl =
    process.env.STRIPE_BILLING_PORTAL_RETURN_URL ??
    `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`;

  try {
    const { url } = await createBillingPortalSession(customerId, returnUrl);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to open billing portal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
