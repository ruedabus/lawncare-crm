import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { sendSms } from "../../../../lib/sms/send";
import { getPlanConfig } from "../../../../lib/plans";

/**
 * GET /api/cron/customer-sms-reminders
 *
 * Sends an SMS to each customer who has a job scheduled for TOMORROW
 * and has a phone number on file. One text per customer per day.
 *
 * Only runs for owners on Pro or Premier plans with
 * sms_customer_reminders_enabled = true (default true when on eligible plan).
 *
 * Called automatically by Vercel Cron (vercel.json) every evening at 6 PM ET.
 * Secured via CRON_SECRET env var.
 */
export async function GET(request: Request) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceClient();

  // ── Tomorrow's date window (UTC) ───────────────────────────────────────────
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // ── Fetch tomorrow's jobs that have a customer with a phone number ─────────
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select(`
      id, title, scheduled_start, user_id,
      customers ( id, name, phone )
    `)
    .gte("scheduled_start", tomorrowStart.toISOString())
    .lte("scheduled_start", tomorrowEnd.toISOString())
    .neq("status", "cancelled");

  if (jobsError) {
    console.error("[customer-sms-reminders] jobs fetch error:", jobsError);
    return NextResponse.json({ error: jobsError.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ sent: 0, message: "No jobs tomorrow." });
  }

  // ── Load settings for all relevant owners ─────────────────────────────────
  const ownerIds = [...new Set(jobs.map((j) => j.user_id as string))];
  const { data: settingsRows } = await supabase
    .from("settings")
    .select("user_id, plan_name, business_name, sms_customer_reminders_enabled")
    .in("user_id", ownerIds);

  const settingsMap = new Map(
    (settingsRows ?? []).map((s) => [s.user_id as string, s])
  );

  function ownerEligible(userId: string): boolean {
    const s = settingsMap.get(userId);
    if (!s) return false;
    if (s.sms_customer_reminders_enabled === false) return false;
    const config = getPlanConfig(s.plan_name);
    return config.smsReminders;
  }

  // ── Format tomorrow's date for the message ────────────────────────────────
  const dateLabel = tomorrowStart.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  // ── Deduplicate: one SMS per customer per owner (in case of multiple jobs) ─
  const seen = new Set<string>(); // `${userId}-${customerId}`
  let sent = 0;
  const errors: string[] = [];

  for (const job of jobs) {
    if (!ownerEligible(job.user_id)) continue;

    const customer = Array.isArray(job.customers) ? job.customers[0] : job.customers;
    if (!customer?.phone) continue;

    const dedupeKey = `${job.user_id}-${customer.id}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const settings = settingsMap.get(job.user_id);
    const businessName = settings?.business_name ?? "Your Lawn Care Pro";

    const timeStr = job.scheduled_start
      ? new Date(job.scheduled_start).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        })
      : "";

    const smsBody =
      `Hi ${customer.name}, this is a reminder that your lawn service is scheduled for tomorrow, ${dateLabel}` +
      (timeStr ? ` at ${timeStr}` : "") +
      `. Reply STOP to opt out. – ${businessName}`;

    const result = await sendSms(customer.phone, smsBody);
    if (result.ok) {
      sent++;
    } else {
      errors.push(`${customer.name} (${customer.phone}): ${result.error}`);
    }
  }

  console.log(`[customer-sms-reminders] sent=${sent} errors=${errors.length}`);
  return NextResponse.json({ sent, errors });
}
