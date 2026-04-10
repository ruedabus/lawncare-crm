import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const supabase = await createClient();

    // Fetch the existing job first (needed for recurring logic + validation)
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Build partial update — only include fields that were sent
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json({ error: "Job title is required." }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    if (body.service_date !== undefined) updates.service_date = body.service_date || null;
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes?.trim() || null;
    if (body.is_recurring !== undefined) updates.is_recurring = body.is_recurring;
    if (body.recurrence_weeks !== undefined) {
      updates.recurrence_weeks = body.is_recurring ?? existingJob.is_recurring
        ? (body.recurrence_weeks ?? 1)
        : null;
    }

    const { data, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-create the next recurring job when this one is marked completed
    const wasNotCompleted = existingJob.status !== "completed";
    const isNowCompleted = body.status === "completed";
    const jobIsRecurring = data.is_recurring ?? existingJob.is_recurring;
    const weeks = data.recurrence_weeks ?? existingJob.recurrence_weeks;

    if (wasNotCompleted && isNowCompleted && jobIsRecurring && weeks) {
      const currentDate = data.service_date ?? existingJob.service_date;
      let nextDate: string | null = null;

      if (currentDate) {
        const d = new Date(currentDate + "T12:00:00");
        d.setDate(d.getDate() + weeks * 7);
        nextDate = d.toISOString().split("T")[0];
      }

      await supabase.from("jobs").insert([{
        customer_id: existingJob.customer_id,
        title: existingJob.title,
        service_date: nextDate,
        status: "scheduled",
        notes: existingJob.notes ?? null,
        is_recurring: true,
        recurrence_weeks: weeks,
      }]);
    }

    return NextResponse.json({ job: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update job." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete job." },
      { status: 500 }
    );
  }
}
