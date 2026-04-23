import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getTeamContext } from "../../../lib/team";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      notes,
      due_date,
      status,
      scheduled_start,
      scheduled_end,
      assigned_to,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required." },
        { status: 400 }
      );
    }

    if (scheduled_start && Number.isNaN(new Date(scheduled_start).getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduled start." },
        { status: 400 }
      );
    }

    if (scheduled_end && Number.isNaN(new Date(scheduled_end).getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduled end." },
        { status: 400 }
      );
    }

    if (scheduled_start && scheduled_end) {
      const start = new Date(scheduled_start);
      const end = new Date(scheduled_end);

      if (end <= start) {
        return NextResponse.json(
          { error: "Scheduled end must be after scheduled start." },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { ownerId } = await getTeamContext(supabase, user.id);

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: ownerId,
          title: title.trim(),
          notes: notes?.trim() || null,
          due_date: due_date || null,
          status: status || "todo",
          scheduled_start: scheduled_start || null,
          scheduled_end: scheduled_end || null,
          assigned_to: assigned_to || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create task." },
      { status: 500 }
    );
  }
}