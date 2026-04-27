import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { getWeatherForecast, forecastForDate } from "../../../../lib/weather";
import { weatherAlertEmail, WeatherAlertJob } from "../../../../lib/email/templates";
import { sendEmail } from "../../../../lib/email/send";

/**
 * GET /api/cron/weather-check
 *
 * Runs daily at 6 AM. For every Premier owner with a service location set:
 *   1. Fetch jobs scheduled in the next 3 days (status: scheduled | in_progress)
 *      that haven't been weather-flagged yet.
 *   2. Call Open-Meteo for the owner's lat/lon.
 *   3. Flag any jobs with bad weather (rain >40%, storm, wind >25mph, heat >100°F).
 *   4. Send ONE summary email to the owner listing all flagged jobs.
 *
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.yardpilot.net";

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]!;
  // Check jobs in the next 3 days (today + 2 more)
  const plusThree = new Date(now);
  plusThree.setDate(plusThree.getDate() + 3);
  const plusThreeStr = plusThree.toISOString().split("T")[0]!;

  // ── Find all Premier owners with lat/lon configured ────────────────────────
  const { data: eligibleSettings } = await supabase
    .from("settings")
    .select("user_id, business_name, business_email, service_lat, service_lon, plan_name")
    .eq("plan_name", "premier")
    .not("service_lat", "is", null)
    .not("service_lon", "is", null);

  if (!eligibleSettings || eligibleSettings.length === 0) {
    return NextResponse.json({ checked: 0, flagged: 0, message: "No eligible Premier owners." });
  }

  let totalFlagged = 0;
  const errors: string[] = [];

  for (const owner of eligibleSettings) {
    try {
      // ── Fetch unflagged, upcoming jobs for this owner ──────────────────────
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title, service_date, customer_id, customers(name)")
        .eq("user_id", owner.user_id)
        .in("status", ["scheduled", "in_progress"])
        .eq("weather_flagged", false)
        .gte("service_date", todayStr)
        .lte("service_date", plusThreeStr);

      if (!jobs || jobs.length === 0) continue;

      // ── Fetch weather once per owner ───────────────────────────────────────
      const forecasts = await getWeatherForecast(
        Number(owner.service_lat),
        Number(owner.service_lon),
        4
      );

      const alertJobs: WeatherAlertJob[] = [];

      for (const job of jobs) {
        if (!job.service_date) continue;

        const forecast = forecastForDate(forecasts, job.service_date);
        if (!forecast?.flagged) continue;

        // Flag the job in the DB
        await supabase
          .from("jobs")
          .update({
            weather_flagged: true,
            weather_flag_reason: forecast.summary,
            weather_flagged_at: now.toISOString(),
          })
          .eq("id", job.id);

        totalFlagged++;

        const customerName = Array.isArray(job.customers)
          ? (job.customers[0]?.name ?? "Unknown")
          : ((job.customers as { name?: string } | null)?.name ?? "Unknown");

        alertJobs.push({
          title: job.title,
          serviceDate: job.service_date,
          customerName,
          weatherSummary: forecast.summary,
        });
      }

      // ── Send one summary email to the owner ────────────────────────────────
      if (alertJobs.length > 0 && owner.business_email) {
        const html = weatherAlertEmail({
          businessName: owner.business_name ?? "Your Business",
          ownerEmail: owner.business_email,
          jobs: alertJobs,
          appUrl,
        });

        await sendEmail({
          to: owner.business_email,
          subject: `⛈️ Weather Alert — ${alertJobs.length} job${alertJobs.length !== 1 ? "s" : ""} may need rescheduling`,
          html,
          fromName: "YardPilot",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`owner ${owner.user_id}: ${msg}`);
      console.error("[cron/weather-check] error:", owner.user_id, err);
    }
  }

  console.log(`[cron] weather-check: checked=${eligibleSettings.length} flagged=${totalFlagged} errors=${errors.length}`);
  return NextResponse.json({ checked: eligibleSettings.length, flagged: totalFlagged, errors });
}
