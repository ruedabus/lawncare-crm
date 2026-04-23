import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { checkCustomerLimit } from "../../../lib/plan-guard";
import { getTeamContext, canWrite } from "../../../lib/team";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const teamCtx = await getTeamContext(supabase, user.id);
    if (!canWrite(teamCtx)) return NextResponse.json({ error: "Dispatchers cannot create customers." }, { status: 403 });
    const { ownerId } = teamCtx;

    const limitError = await checkCustomerLimit(ownerId);
    if (limitError) return NextResponse.json({ error: limitError }, { status: 403 });

    const { data, error } = await supabase
      .from("customers")
      .insert([{
        user_id: ownerId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create customer." },
      { status: 500 }
    );
  }
}
