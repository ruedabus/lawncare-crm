import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getTeamContext } from "../../../../lib/team";
import { getUserPlanInfo } from "../../../../lib/plan-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await getTeamContext(supabase, user.id);

  const { config } = await getUserPlanInfo(ownerId);
  if (!config.expenseLogging) {
    return NextResponse.json({ error: "Expense tracking is available on Pro and Premier plans." }, { status: 403 });
  }

  const body = await request.json();
  const { date, category, description, amount, notes } = body;

  const updates: Record<string, unknown> = {};
  if (date !== undefined) updates.date = date;
  if (category !== undefined) updates.category = category;
  if (description !== undefined) updates.description = description.trim();
  if (amount !== undefined) updates.amount = Number(amount);
  if (notes !== undefined) updates.notes = notes?.trim() || null;

  const { data, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", id)
    .eq("user_id", ownerId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Expense not found." }, { status: 404 });

  return NextResponse.json({ expense: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await getTeamContext(supabase, user.id);

  const { config } = await getUserPlanInfo(ownerId);
  if (!config.expenseLogging) {
    return NextResponse.json({ error: "Expense tracking is available on Pro and Premier plans." }, { status: 403 });
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", ownerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
