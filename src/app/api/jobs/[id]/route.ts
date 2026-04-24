import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getUserPlanInfo } from "../../../../lib/plan-guard";
import { sendEmail } from "../../../../lib/email/send";
import { buildReviewRequestEmail } from "../../../../lib/email/templates";

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

    if (body.recurrence_type !== undefined) {
      updates.recurrence_type = body.recurrence_type || null;
    }

    if (body.recurrence_end_date !== undefined) {
      updates.recurrence_end_date = body.recurrence_end_date || null;
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
        const d = new Date(`${currentDate}T12:00:00`);
        d.setDate(d.getDate() + weeks * 7);
        nextDate = d.toISOString().split("T")[0];
      }

      if (recurrenceEndDate && nextDate) {
        const next = new Date(`${nextDate}T12:00:00`);
        const end = new Date(`${recurrenceEndDate}T12:00:00`);

        if (next > end) {
          return NextResponse.json({ job: data }, { status: 200 });
        }
      }

      let nextRecurringScheduledStart: string | null = null;
      let nextRecurringScheduledEnd: string | null = null;

      const currentScheduledStart =
        data.scheduled_start ?? existingJob.scheduled_start;
      const currentScheduledEnd =
        data.scheduled_end ?? existingJob.scheduled_end;

      if (currentScheduledStart) {
        const start = new Date(currentScheduledStart);
        start.setDate(start.getDate() + weeks * 7);
        nextRecurringScheduledStart = start.toISOString();
      }

      if (currentScheduledEnd) {
        const end = new Date(currentScheduledEnd);
        end.setDate(end.getDate() + weeks * 7);
        nextRecurringScheduledEnd = end.toISOString();
      }

      await supabase.from("jobs").insert([
        {
          user_id: existingJob.user_id ?? null,
          customer_id: existingJob.customer_id,
          technician_id: existingJob.technician_id ?? null,
          title: existingJob.title,
          service_date: nextDate,
          scheduled_start: nextRecurringScheduledStart,
          scheduled_end: nextRecurringScheduledEnd,
          status: "scheduled",
          notes: existingJob.notes ?? null,
          is_recurring: true,
          recurrence_weeks: weeks,
          recurrence_type: recurrenceType ?? null,
          recurrence_end_date: recurrenceEndDate ?? null,
        },
      ]);
    }

    // ── Review request email on job completion ────────────────────────────────
    // Fires when a job transitions to "completed" for the first time.
    // Gated to Pro and Premier plans. Requires google_review_url in settings.
    if (wasNotCompleted && isNowCompleted) {
      try {
        const ownerId = existingJob.user_id;
        const { planName } = await getUserPlanInfo(ownerId);

        if (planName === "pro" || planName === "premier") {
          // Fetch owner settings for business name + review URL
          const { data: settings } = await supabase
            .from("settings")
            .select("business_name, business_email, google_review_url")
            .eq("user_id", ownerId)
            .maybeSingle();

          if (settings?.google_review_url && existingJob.customer_id) {
            // Fetch customer email + name
            const { data: customer } = await supabase
              .from("customers")
              .select("name, email")
              .eq("id", existingJob.customer_id)
              .maybeSingle();

            if (customer?.email) {
              // Fetch before/after photos for the email
              const { data: photos } = await supabase
                .from("job_photos")
                .select("type, storage_path")
                .eq("job_id", id)
                .order("created_at", { ascending: true });

              const beforePath = photos?.find((p) => p.type === "before")?.storage_path;
              const afterPath = photos?.find((p) => p.type === "after")?.storage_path;

              const getSignedUrl = async (path: string | undefined) => {
                if (!path) return null;
                const { data } = await supabase.storage
                  .from("job-photos")
                  .createSignedUrl(path, 60 * 60 * 24); // 24h so link works in email
                return data?.signedUrl ?? null;
              };

              const [beforePhotoUrl, afterPhotoUrl] = await Promise.all([
                getSignedUrl(beforePath),
                getSignedUrl(afterPath),
              ]);

              await sendEmail({
                to: customer.email,
                fromName: settings.business_name ?? "Your Lawn Care Team",
                replyTo: settings.business_email ?? undefined,
                subject: `How did we do? — ${settings.business_name ?? "Your lawn care team"}`,
                html: buildReviewRequestEmail({
                  customerName: customer.name ?? "there",
                  businessName: settings.business_name ?? "Your Lawn Care Team",
                  jobTitle: existingJob.title,
                  reviewUrl: settings.google_review_url,
                  beforePhotoUrl,
                  afterPhotoUrl,
                }),
              }).catch(console.error); // fire-and-forget, never block the response
            }
          }
        }
      } catch (err) {
        console.error("[review-request] error:", err);
        // Never block job update if review email fails
      }
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