import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getTeamContext } from "../../../lib/team";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, source, status, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Lead name is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { ownerId } = await getTeamContext(supabase, user.id);

    const { data, error } = await supabase
      .from("leads")
      .insert([{
        user_id: ownerId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        source: source?.trim() || null,
        status: status || "new",
        notes: notes?.trim() || null,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lead: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create lead." },
      { status: 500 }
    );
  }
}
