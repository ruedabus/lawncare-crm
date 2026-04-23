import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { checkFeatureAccess } from "../../../lib/plan-guard";
import { getTeamContext, canWrite } from "../../../lib/team";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const teamCtx = await getTeamContext(supabase, user.id);
    if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    const { ownerId } = teamCtx;

    const featureError = await checkFeatureAccess("estimates");
    if (featureError) return NextResponse.json({ error: featureError }, { status: 403 });

    const body = await request.json();
    const { customer_id, title, description, line_items, valid_until, notes } = body;

    if (!customer_id || !title?.trim()) {
      return NextResponse.json({ error: "Customer and title are required." }, { status: 400 });
    }

    const items = Array.isArray(line_items) ? line_items : [];
    const total = items.reduce((sum: number, item: { amount?: number }) => sum + (Number(item.amount) || 0), 0);

    const { data, error } = await supabase
      .from("estimates")
      .insert([{
        user_id: ownerId,
        customer_id,
        title: title.trim(),
        description: description?.trim() || null,
        line_items: items,
        total,
        status: "draft",
        valid_until: valid_until || null,
        notes: notes?.trim() || null,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ estimate: data }, { status: 201 });
  } catch (err) {
    console.error("API ESTIMATE POST ERROR:", err);
    return NextResponse.json({ error: "Failed to create estimate." }, { status: 500 });
  }
}
