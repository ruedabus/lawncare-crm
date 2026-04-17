import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { sendEmail } from "../../../../lib/email/send";
import {
  technicianReminderEmail,
  TechJobItem,
  TechTaskItem,
} from "../../../../lib/email/templates";

/**
 * GET /api/cron/tech-reminders
 *
 * Sends a daily morning digest to each technician who has jobs or tasks
 * scheduled for today. One email per technician — not one per job.
 *
 * Called automatically by Vercel Cron (vercel.json) every day at 7 AM.
 * Can also be triggered manually with the CRON_SECRET bearer token.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceClient();

  // Today's date range in UTC (jobs store ISO timestamps)
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const todayDateStr = now.toISOString().slice(0, 10); // for task due_date

  // ── Fetch today's jobs with a technician assigned ──────────────────────────
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select(`
      id, title, notes, scheduled_start, scheduled_end,
      technician_id,
      technicians ( id, name, email ),
      customers ( name, address )
    `)
    .not("technician_id", "is", null)
    .gte("scheduled_start", todayStart.toISOString())
    .lte("scheduled_start", todayEnd.toISOString())
    .neq("status", "cancelled");

  if (jobsError) {
    console.error("[tech-reminders] jobs fetch error:", jobsError);
    return NextResponse.json({ error: jobsError.message }, { status: 500 });
  }

  // ── Fetch today's tasks with a technician assigned ─────────────────────────
  // tasks.assigned_to is a plain UUID (no FK), so we fetch technicians separately
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, notes, scheduled_start, scheduled_end, due_date, assigned_to")
    .not("assigned_to", "is", null)
    .or(
      `due_date.eq.${todayDateStr},and(scheduled_start.gte.${todayStart.toISOString()},scheduled_start.lte.${todayEnd.toISOString()})`
    )
    .neq("status", "done");

  if (tasksError) {
    console.error("[tech-reminders] tasks fetch error:", tasksError);
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  // Fetch technicians for the assigned_to IDs from tasks
  const taskTechIds = [...new Set((tasks ?? []).map((t) => t.assigned_to).filter(Boolean))];
  const taskTechMap = new Map<string, { id: string; name: string; email: string }>();
  if (taskTechIds.length > 0) {
    const { data: taskTechs } = await supabase
      .from("technicians")
      .select("id, name, email")
      .in("id", taskTechIds);
    for (const tech of taskTechs ?? []) {
      taskTechMap.set(tech.id, tech);
    }
  }

  // ── Build a map of technician → items ─────────────────────────────────────
  type TechEntry = {
    id: string;
    name: string;
    email: string;
    items: (TechJobItem | TechTaskItem)[];
  };

  const techMap = new Map<string, TechEntry>();

  function getTech(id: string, name: string, email: string): TechEntry {
    if (!techMap.has(id)) {
      techMap.set(id, { id, name, email, items: [] });
    }
    return techMap.get(id)!;
  }

  for (const job of jobs ?? []) {
    const tech = Array.isArray(job.technicians)
      ? job.technicians[0]
      : job.technicians;
    if (!tech?.email) continue;

    const customer = Array.isArray(job.customers)
      ? job.customers[0]
      : job.customers;

    const entry = getTech(tech.id, tech.name, tech.email);
    entry.items.push({
      type: "job",
      title: job.title,
      customerName: customer?.name ?? "Customer",
      address: customer?.address ?? null,
      scheduledStart: job.scheduled_start ?? null,
      scheduledEnd: job.scheduled_end ?? null,
      notes: job.notes ?? null,
    });
  }

  for (const task of tasks ?? []) {
    const tech = taskTechMap.get(task.assigned_to);
    if (!tech?.email) continue;

    const entry = getTech(tech.id, tech.name, tech.email);
    entry.items.push({
      type: "task",
      title: task.title,
      scheduledStart: task.scheduled_start ?? null,
      scheduledEnd: task.scheduled_end ?? null,
      dueDate: task.due_date ?? null,
      notes: task.notes ?? null,
    });
  }

  if (techMap.size === 0) {
    return NextResponse.json({ sent: 0, message: "No technicians with work today." });
  }

  // ── Fetch business settings for sender info ────────────────────────────────
  const { data: settings } = await supabase
    .from("settings")
    .select("business_name, business_phone")
    .limit(1)
    .single();

  const businessName = settings?.business_name ?? "Your Lawn Care Company";
  const businessPhone = settings?.business_phone ?? undefined;

  // ── Format today's date nicely ─────────────────────────────────────────────
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  // ── Send one digest email per technician ───────────────────────────────────
  let sent = 0;
  const errors: string[] = [];

  for (const tech of techMap.values()) {
    // Sort items by scheduled start time
    tech.items.sort((a, b) => {
      const aTime = a.scheduledStart ? new Date(a.scheduledStart).getTime() : Infinity;
      const bTime = b.scheduledStart ? new Date(b.scheduledStart).getTime() : Infinity;
      return aTime - bTime;
    });

    const html = technicianReminderEmail({
      techName: tech.name,
      businessName,
      businessPhone,
      date: dateLabel,
      items: tech.items,
    });

    const result = await sendEmail({
      to: tech.email,
      subject: `Your schedule for ${dateLabel} — ${businessName}`,
      html,
      fromName: businessName,
    });

    if (result.ok) {
      sent++;
    } else {
      errors.push(`${tech.name} <${tech.email}>: ${result.error}`);
    }
  }

  console.log(`[tech-reminders] sent=${sent} errors=${errors.length}`);
  return NextResponse.json({ sent, errors });
}
