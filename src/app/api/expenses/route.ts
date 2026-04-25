import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getTeamContext } from "../../../lib/team";
import { getUserPlanInfo } from "../../../lib/plan-guard";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await getTeamContext(supabase, user.id);

  const { config } = await getUserPlanInfo(ownerId);
  if (!config.expenseLogging) {
    return NextResponse.json({ error: "Expense tracking is available on Pro and Premier plans." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", ownerId)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ expenses: data });
}

export async function POST(request: Request) {
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

  if (!date || !category || !description || amount == null) {
    return NextResponse.json({ error: "Date, category, description, and amount are required." }, { status: 400 });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert([{
      user_id: ownerId,
      date,
      category,
      description: description.trim(),
      amount: parsedAmount,
      notes: notes?.trim() || null,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ expense: data }, { status: 201 });
}
