import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, notes, due_date, status } = body;

    const supabase = await createClient();

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title.trim();
    if (notes !== undefined) updates.notes = notes?.trim() || null;
    if (due_date !== undefined) updates.due_date = due_date || null;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}
