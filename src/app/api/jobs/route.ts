import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, title, service_date, status, notes, is_recurring, recurrence_weeks } = body;

    if (!customer_id || !title || !title.trim()) {
      return NextResponse.json(
        { error: "Customer and job title are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .insert([{
        customer_id,
        title: title.trim(),
        service_date: service_date || null,
        status: status || "scheduled",
        notes: notes?.trim() || null,
        is_recurring: is_recurring ?? false,
        recurrence_weeks: is_recurring ? (recurrence_weeks ?? 1) : null,
      }])
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