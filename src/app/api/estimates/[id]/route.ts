import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const body = await request.json();

    // Recalculate total if line_items are being updated
    const updates: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() };
    if (Array.isArray(body.line_items)) {
      updates.total = body.line_items.reduce(
        (sum: number, item: { amount?: number }) => sum + (Number(item.amount) || 0), 0
      );
    }

    const { data, error } = await supabase
      .from("estimates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ estimate: data });
  } catch (err) {
    console.error("API ESTIMATE PATCH ERROR:", err);
    return NextResponse.json({ error: "Failed to update estimate." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { error } = await supabase.from("estimates").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API ESTIMATE DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete estimate." }, { status: 500 });
  }
}
