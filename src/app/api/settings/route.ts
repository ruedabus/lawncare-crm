import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getTeamContext, canWrite, canAccessBilling } from "../../../lib/team";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ownerId } = await getTeamContext(supabase, user.id);

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", ownerId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data ?? {} });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const teamCtx = await getTeamContext(supabase, user.id);

  const body = await req.json();

  // Billing fields are owner-only; all other settings require owner or admin
  const billingFields = ["stripe_customer_id", "stripe_subscription_id", "subscription_status", "plan_name"];
  const touchesBilling = billingFields.some((f) => f in body);
  if (touchesBilling && !canAccessBilling(teamCtx)) {
    return NextResponse.json({ error: "Only the account owner can change billing settings." }, { status: 403 });
  }
  if (!canWrite(teamCtx)) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  const { ownerId } = teamCtx;

  const { data, error } = await supabase
    .from("settings")
    .upsert(
      { ...body, user_id: ownerId, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
