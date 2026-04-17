import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type RecurrenceType = "weekly_6_months" | "biweekly_6_months" | null;

function addMonthsToDateString(dateString: string, months: number) {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + months);

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function getAnchorDate(
  serviceDate: string | null,
  scheduledStart: string | null
) {
  if (serviceDate) return serviceDate;

  if (scheduledStart) {
    const parsed = new Date(scheduledStart);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      technician_id,
      title,
      service_date,
      scheduled_start,
      scheduled_end,
      status,
      notes,
      is_recurring,
      recurrence_weeks,
      recurrence_type,
    } = body;

    if (!customer_id || !title || !title.trim()) {
      return NextResponse.json(
        { error: "Customer and job title are required." },
        { status: 400 }
      );
    }

    if (scheduled_start && scheduled_end) {
      const start = new Date(scheduled_start);
      const end = new Date(scheduled_end);

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

    const allowedRecurrenceTypes: RecurrenceType[] = [
      "weekly_6_months",
      "biweekly_6_months",
      null,
    ];

    const normalizedRecurrenceType: RecurrenceType =
      recurrence_type && allowedRecurrenceTypes.includes(recurrence_type)
        ? recurrence_type
        : null;

    let normalizedRecurrenceWeeks: number | null = null;
    let recurrenceEndDate: string | null = null;

    if (is_recurring) {
      if (normalizedRecurrenceType === "weekly_6_months") {
        normalizedRecurrenceWeeks = 1;
      } else if (normalizedRecurrenceType === "biweekly_6_months") {
        normalizedRecurrenceWeeks = 2;
      } else {
        const parsedWeeks = Number(recurrence_weeks ?? 1);

        if (!Number.isFinite(parsedWeeks) || parsedWeeks < 1) {
          return NextResponse.json(
            { error: "Invalid recurrence interval." },
            { status: 400 }
          );
        }

        normalizedRecurrenceWeeks = parsedWeeks;
      }

      if (normalizedRecurrenceType) {
        const anchorDate = getAnchorDate(
          service_date || null,
          scheduled_start || null
        );

        if (!anchorDate) {
          return NextResponse.json(
            {
              error:
                "Recurring seasonal jobs need a service date or scheduled start.",
            },
            { status: 400 }
          );
        }

        recurrenceEndDate = addMonthsToDateString(anchorDate, 6);

        if (!recurrenceEndDate) {
          return NextResponse.json(
            { error: "Unable to calculate recurrence end date." },
            { status: 400 }
          );
        }
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          user_id: user.id,
          customer_id,
          technician_id: technician_id || null,
          title: title.trim(),
          service_date: service_date || null,
          scheduled_start: scheduled_start || null,
          scheduled_end: scheduled_end || null,
          status: status || "scheduled",
          notes: notes?.trim() || null,
          is_recurring: is_recurring ?? false,
          recurrence_weeks: is_recurring ? normalizedRecurrenceWeeks : null,
          recurrence_type: is_recurring ? normalizedRecurrenceType : null,
          recurrence_end_date: is_recurring ? recurrenceEndDate : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE JOB INSERT ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ job: data }, { status: 201 });
  } catch (err) {
    console.error("API JOB POST ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create job." },
      { status: 500 }
    );
  }
}