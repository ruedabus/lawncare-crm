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

    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json(
          { error: "Job title is required." },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if (body.service_date !== undefined) {
      updates.service_date = body.service_date || null;
    }

    if (body.status !== undefined) {
      updates.status = body.status;
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes?.trim() || null;
    }

    if (body.technician_id !== undefined) {
      updates.technician_id = body.technician_id || null;
    }

    if (body.scheduled_start !== undefined) {
      updates.scheduled_start = body.scheduled_start || null;
    }

    if (body.scheduled_end !== undefined) {
      updates.scheduled_end = body.scheduled_end || null;
    }

    const nextScheduledStart =
      body.scheduled_start !== undefined
        ? body.scheduled_start
        : existingJob.scheduled_start;

    const nextScheduledEnd =
      body.scheduled_end !== undefined
        ? body.scheduled_end
        : existingJob.scheduled_end;

    if (nextScheduledStart && nextScheduledEnd) {
      const start = new Date(nextScheduledStart);
      const end = new Date(nextScheduledEnd);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduled start or end time." },
          { status: 400 }
        );
      }

      if (end <= start) {
        return NextResponse.json(
          { error: "End time must be after start time." },
          { status: 400 }
        );
      }
    }

    if (body.is_recurring !== undefined) {
      updates.is_recurring = body.is_recurring;
    }

    if (body.recurrence_weeks !== undefined) {
      updates.recurrence_weeks =
        body.is_recurring ?? existingJob.is_recurring
          ? body.recurrence_weeks ?? 1
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

    const wasNotCompleted = existingJob.status !== "completed";
const isNowCompleted = body.status === "completed";

const jobIsRecurring = data.is_recurring ?? existingJob.is_recurring;
const weeks = data.recurrence_weeks ?? existingJob.recurrence_weeks;
const recurrenceType =
  data.recurrence_type ?? existingJob.recurrence_type;
const recurrenceEndDate =
  data.recurrence_end_date ?? existingJob.recurrence_end_date;

if (wasNotCompleted && isNowCompleted && jobIsRecurring && weeks) {
  const currentDate = data.service_date ?? existingJob.service_date;

  let nextDate: string | null = null;

  if (currentDate) {
    const d = new Date(currentDate + "T12:00:00");
    d.setDate(d.getDate() + weeks * 7);
    nextDate = d.toISOString().split("T")[0];
  }

  // 🚨 STOP if past recurrence end date
  if (recurrenceEndDate && nextDate) {
    const next = new Date(nextDate + "T12:00:00");
    const end = new Date(recurrenceEndDate + "T12:00:00");

    if (next > end) {
      // Stop creating future jobs
      return NextResponse.json({ job: data }, { status: 200 });
    }
  }

  let nextScheduledStart: string | null = null;
  let nextScheduledEnd: string | null = null;

  const currentScheduledStart =
    data.scheduled_start ?? existingJob.scheduled_start;
  const currentScheduledEnd =
    data.scheduled_end ?? existingJob.scheduled_end;

  if (currentScheduledStart) {
    const start = new Date(currentScheduledStart);
    start.setDate(start.getDate() + weeks * 7);
    nextScheduledStart = start.toISOString();
  }

  if (currentScheduledEnd) {
    const end = new Date(currentScheduledEnd);
    end.setDate(end.getDate() + weeks * 7);
    nextScheduledEnd = end.toISOString();
  }

  await supabase.from("jobs").insert([
    {
      user_id: existingJob.user_id ?? null,
      customer_id: existingJob.customer_id,
      technician_id: existingJob.technician_id ?? null,
      title: existingJob.title,
      service_date: nextDate,
      scheduled_start: nextScheduledStart,
      scheduled_end: nextScheduledEnd,
      status: "scheduled",
      notes: existingJob.notes ?? null,
      is_recurring: true,
      recurrence_weeks: weeks,
      recurrence_type: recurrenceType,
      recurrence_end_date: recurrenceEndDate,
    },
  ]);
}
      const currentDate = data.service_date ?? existingJob.service_date;
      let nextDate: string | null = null;

      if (currentDate) {
        const d = new Date(currentDate + "T12:00:00");
        d.setDate(d.getDate() + weeks * 7);
        nextDate = d.toISOString().split("T")[0];
      }

      let nextScheduledStart: string | null = null;
      let nextScheduledEnd: string | null = null;

      const currentScheduledStart =
        data.scheduled_start ?? existingJob.scheduled_start;
      const currentScheduledEnd =
        data.scheduled_end ?? existingJob.scheduled_end;

      if (currentScheduledStart) {
        const start = new Date(currentScheduledStart);
        start.setDate(start.getDate() + weeks * 7);
        nextScheduledStart = start.toISOString();
      }

      if (currentScheduledEnd) {
        const end = new Date(currentScheduledEnd);
        end.setDate(end.getDate() + weeks * 7);
        nextScheduledEnd = end.toISOString();
      }

      await supabase.from("jobs").insert([
        {
          user_id: existingJob.user_id ?? null,
          customer_id: existingJob.customer_id,
          technician_id: existingJob.technician_id ?? null,
          title: existingJob.title,
          service_date: nextDate,
          scheduled_start: nextScheduledStart,
          scheduled_end: nextScheduledEnd,
          status: "scheduled",
          notes: existingJob.notes ?? null,
          is_recurring: true,
          recurrence_weeks: weeks,
        },
      ]);
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