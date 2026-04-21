import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../../../lib/supabase/server";
import { disconnectConnectedAccount } from "../../../../../lib/stripe/api";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the current stripe_account_id
  const { data: settings } = await supabase
    .from("settings")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripeAccountId = settings?.stripe_account_id;

  // Deauthorize on Stripe's side (best-effort)
  if (stripeAccountId) {
    await disconnectConnectedAccount(stripeAccountId);
  }

  // Clear from DB regardless
  const service = createServiceClient();
  const { error } = await service
    .from("settings")
    .update({ stripe_account_id: null, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
