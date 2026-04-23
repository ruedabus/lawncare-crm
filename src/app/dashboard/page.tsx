import {
  BanknotesIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UsersIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getTeamContext } from "../../lib/team";
import { AppShell } from "../../components/layout/app-shell";

// ── Weather helpers ──────────────────────────────────────────────────────────

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "T-storm w/ hail",
  99: "T-storm w/ hail",
};

type WeatherType = "sunny" | "partlyCloudy" | "cloudy" | "rain" | "snow" | "storm" | "fog";

function weatherType(code: number): WeatherType {
  if (code <= 1) return "sunny";
  if (code === 2) return "partlyCloudy";
  if (code === 3 || code === 45 || code === 48) return "cloudy";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 95) return "storm";
  return "cloudy";
}

function WeatherIcon({ code, size = 48 }: { code: number; size?: number }) {
  const type = weatherType(code);
  const s = size;

  if (type === "sunny") {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="10" fill="#FCD34D" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <line
            key={i}
            x1="24" y1="6"
            x2="24" y2="2"
            stroke="#FCD34D"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${deg} 24 24)`}
          />
        ))}
      </svg>
    );
  }

  if (type === "partlyCloudy") {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        {/* sun behind cloud */}
        <circle cx="18" cy="18" r="8" fill="#FCD34D" />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <line key={i} x1="18" y1="7" x2="18" y2="4"
            stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"
            transform={`rotate(${deg} 18 18)`} />
        ))}
        {/* cloud */}
        <path
          d="M14 34c-3.3 0-6-2.7-6-6 0-3 2.1-5.4 5-5.9.5-3.4 3.4-6 6.9-6 3.8 0 6.8 3 7 6.8H28c2.2 0 4 1.8 4 4s-1.8 4-4 4H14z"
          fill="#CBD5E1"
        />
      </svg>
    );
  }

  if (type === "cloudy") {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path
          d="M12 36c-4.4 0-8-3.6-8-8 0-4 2.8-7.2 6.6-7.9C11.7 15.5 15.5 12 20.2 12c5 0 9.1 4 9.3 9H30c3 0 5.3 2.4 5.3 5.3S33 36 30 36H12z"
          fill="#94A3B8"
        />
        <path
          d="M30 38c-3.3 0-6-2.7-6-6 0-2.8 2-5.1 4.7-5.8C29.3 23.6 31.6 22 34.2 22c3.6 0 6.6 2.9 6.7 6.5H42c2.2 0 4 1.8 4 4s-1.8 4-4 4H30z"
          fill="#CBD5E1"
        />
      </svg>
    );
  }

  if (type === "rain") {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path
          d="M10 28c-4 0-7-3-7-7 0-3.5 2.5-6.4 5.8-7C9.5 10.4 13 8 17 8c4.4 0 8 3.3 8.3 7.5H27c2.6 0 4.7 2.1 4.7 4.7S29.6 25 27 25H10z"
          fill="#94A3B8"
        />
        {/* rain drops */}
        {[10, 18, 26, 34].map((x, i) => (
          <path key={i}
            d={`M${x} 31 Q${x - 1} 35 ${x} 39 Q${x + 1} 35 ${x} 31`}
            fill="#60A5FA" />
        ))}
      </svg>
    );
  }

  if (type === "snow") {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path
          d="M10 24c-4 0-7-3-7-7 0-3.5 2.5-6.4 5.8-7C9.5 6.4 13 4 17 4c4.4 0 8 3.3 8.3 7.5H27c2.6 0 4.7 2.1 4.7 4.7S29.6 21 27 21H10z"
          fill="#CBD5E1"
        />
        {/* snowflakes */}
        {[10, 20, 30].map((x, i) => (
          <g key={i} transform={`translate(${x}, 36)`}>
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    );
  }

  if (type === "storm") {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path
          d="M10 26c-4 0-7-3-7-7 0-3.5 2.5-6.4 5.8-7C9.5 8.4 13 6 17 6c4.4 0 8 3.3 8.3 7.5H27c2.6 0 4.7 2.1 4.7 4.7S29.6 23 27 23H10z"
          fill="#64748B"
        />
        {/* lightning bolt */}
        <path d="M22 27 L16 38 L21 38 L17 48 L28 33 L22 33 Z" fill="#FCD34D" />
      </svg>
    );
  }

  // fog
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {[12, 20, 28, 36].map((y, i) => (
        <line key={i}
          x1="6" y1={y} x2="42" y2={y}
          stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"
          opacity={i % 2 === 0 ? 0.8 : 0.5} />
      ))}
    </svg>
  );
}

function dayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// ── Misc helpers ─────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const { ownerId } = await getTeamContext(supabase, user.id);

  // ── Real stats ──────────────────────────────────────────────────────────
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    { count: totalCustomers },
    { count: activeJobs },
    { count: unpaidInvoices },
    { data: paidRevRows },
    { count: scheduledJobs },
    { count: completedToday },
    { data: chartInvoices },
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .in("status", ["scheduled", "in_progress"]),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("status", "unpaid"),
    supabase
      .from("invoices")
      .select("amount")
      .eq("status", "paid")
      .gte(
        "created_at",
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      ),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "scheduled"),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("updated_at", new Date().toISOString().slice(0, 10)),
    supabase
      .from("invoices")
      .select("amount, created_at")
      .eq("status", "paid")
      .gte("created_at", sixMonthsAgo.toISOString()),
  ]);

  const monthlyRevenue = (paidRevRows ?? []).reduce(
    (sum, row) => sum + (row.amount ?? 0),
    0
  );

  // ── Build 6-month chart data ─────────────────────────────────────────────
  const chartMonths: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    chartMonths.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      value: 0,
    });
  }
  (chartInvoices ?? []).forEach((inv) => {
    const d = new Date(inv.created_at);
    const monthsBack =
      (new Date().getFullYear() - d.getFullYear()) * 12 +
      (new Date().getMonth() - d.getMonth());
    const idx = 5 - monthsBack;
    if (idx >= 0 && idx < 6) {
      chartMonths[idx].value += Number(inv.amount) || 0;
    }
  });
  const chartMax = Math.max(...chartMonths.map((m) => m.value), 1);

  // ── Recent Activity ─────────────────────────────────────────────────────
  const [
    { data: recentCustomers },
    { data: recentJobs },
    { data: recentInvoices },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("jobs")
      .select("title, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("invoices")
      .select("amount, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  type ActivityEvent = { text: string; ts: string };
  const events: ActivityEvent[] = [
    ...(recentCustomers ?? []).map((c) => ({
      text: `Customer added: ${c.name}`,
      ts: c.created_at,
    })),
    ...(recentJobs ?? []).map((j) => ({
      text: `Job created: ${j.title}`,
      ts: j.created_at,
    })),
    ...(recentInvoices ?? []).map((i) => ({
      text: `Invoice created: $${Number(i.amount ?? 0).toFixed(2)}`,
      ts: i.created_at,
    })),
  ];
  events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  const activity = events.slice(0, 6);

  // ── Payment Snapshot ────────────────────────────────────────────────────
  const { count: totalInvoices } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true });

  const { count: paidInvoices } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");

  const paidPct =
    totalInvoices && totalInvoices > 0
      ? Math.round(((paidInvoices ?? 0) / totalInvoices) * 100)
      : 0;

  // ── Weather (Open-Meteo — free, no key) ─────────────────────────────────
  // Pull location from saved settings, fall back to Brooksville FL
  const { data: locationSettings } = await supabase
    .from("settings")
    .select("service_city, service_state, service_lat, service_lon")
    .eq("user_id", ownerId)
    .maybeSingle();

  const weatherLat = locationSettings?.service_lat ?? 28.5553;
  const weatherLon = locationSettings?.service_lon ?? -82.3882;
  const weatherCity = locationSettings?.service_city ?? "Brooksville";
  const weatherState = locationSettings?.service_state ?? "FL";

 type DayForecast = {
  date: string;
  code: number;
  hi: number;
  lo: number;
  rainChance: number;
};

  let currentTemp: number | null = null;
  let currentCode: number | null = null;
  let forecast: DayForecast[] = [];

  try {
const wRes = await fetch(
  "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${weatherLat}&longitude=${weatherLon}` +
    "&current_weather=true" +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&temperature_unit=fahrenheit" +
    "&timezone=America%2FNew_York" +
    "&forecast_days=5",
  { next: { revalidate: 300 } }
);

if (wRes.ok) {
  const wJson = await wRes.json();
  const cw = wJson?.current_weather;

  if (cw) {
    currentTemp = Math.round(cw.temperature);
    currentCode = cw.weathercode;
  }

  const daily = wJson?.daily;
  if (daily?.time) {
    forecast = (daily.time as string[]).map((date: string, i: number) => ({
      date,
      code: daily.weathercode[i],
      hi: Math.round(daily.temperature_2m_max[i]),
      lo: Math.round(daily.temperature_2m_min[i]),
      rainChance: daily.precipitation_probability_max?.[i] ?? 0,
    }));
  }
}
  } catch {
    // silently fall back
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - paidPct / 100);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">

        {/* ── Field Quick-Capture Banner (mobile-prominent) ── */}
        <Link
          href="/leads"
          className="flex items-center justify-between rounded-2xl bg-emerald-600 px-5 py-4 shadow-sm transition hover:bg-emerald-700 active:scale-95"
        >
          <div>
            <p className="text-sm font-semibold text-emerald-100">In the field?</p>
            <p className="mt-0.5 text-lg font-bold text-white">Capture a New Lead</p>
          </div>
          <PlusCircleIcon className="h-10 w-10 shrink-0 text-white opacity-90" />
        </Link>

        {/* Top metric cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
           <Link href="/customers" className="block">
          <MetricCard
           title="Customers"
           value={totalCustomers ?? 0}
           subtitle="Active customer records"
           icon={<UsersIcon className="h-6 w-6" />}
           color="bg-blue-600"
          />
        </Link>   
        <Link href="/jobs" className="block">
       <MetricCard
          title="Jobs"
          value={activeJobs ?? 0}
          subtitle="Open or scheduled jobs"
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          color="bg-violet-600"
         />
       </Link>
         <Link href="/invoices" className="block">
         <MetricCard
           title="Unpaid Invoices"
           value={unpaidInvoices ?? 0}
           subtitle="Invoices awaiting payment"
           icon={<DocumentTextIcon className="h-6 w-6" />}
           color="bg-amber-500"
           />
         </Link>
         <Link href="/invoices" className="block">
         <MetricCard
           title="Monthly Revenue"
           value={`$${monthlyRevenue.toLocaleString()}`}
           subtitle="Current month (paid)"
           icon={<BanknotesIcon className="h-6 w-6" />}
           color="bg-emerald-600"
           />
         </Link>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Business Overview
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Revenue and operations summary
        </p>
      </div>

      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        This Month
      </div>
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <MiniStat label="Revenue" value={`$${monthlyRevenue.toLocaleString()}`} />
      <MiniStat label="Jobs" value={String(activeJobs ?? 0)} />
      <MiniStat label="Unpaid" value={String(unpaidInvoices ?? 0)} />
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Revenue Trend</p>
        <p className="text-xs text-slate-400">Last 6 months</p>
      </div>

      <div className="mt-6 h-48 flex items-end gap-3">
        {chartMonths.map((month) => {
          const pct = Math.round((month.value / chartMax) * 100);
          return (
            <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-40 w-full items-end">
                <div
                  className="w-full rounded-t-xl bg-emerald-500 transition-all duration-700 ease-out"
                  style={{
                    height: pct > 0 ? `${Math.max(pct, 8)}%` : "8px",
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">{month.label}</p>
            </div>
          );
        })}
      </div>
    </div>

    <div className="mt-6 border-t border-slate-100 pt-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          label="6-Month Total"
          value={`$${chartMonths.reduce((s, m) => s + m.value, 0).toLocaleString()}`}
        />
        <SummaryTile
          label="Monthly Avg"
          value={`$${Math.round(chartMonths.reduce((s, m) => s + m.value, 0) / 6).toLocaleString()}`}
        />
        <SummaryTile
          label="Collection Rate"
          value={`${paidPct}%`}
        />
      </div>
    </div>
  </div>

  <div className="space-y-6">
    <PanelCard title="Quick Actions">
      <div className="grid gap-3">
        <ActionLink href="/leads" label="➕ Add Lead" color="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200" />
        <ActionLink href="/customers" label="👤 Add Customer" color="bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200" />
        <ActionLink href="/jobs" label="🗂️ Create Job" color="bg-violet-50 text-violet-800 hover:bg-violet-100 border-violet-200" />
        <ActionLink href="/invoices" label="📄 Create Invoice" color="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200" />
        <ActionLink href="/schedule" label="📅 View Schedule" color="bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200" />
      </div>
    </PanelCard>

    <PanelCard title="Today">
      <div className="space-y-4">
        <StatusRow label="Open Invoices" value={String(unpaidInvoices ?? 0)} />
        <StatusRow label="Active Jobs" value={String(activeJobs ?? 0)} />
        <StatusRow label="Scheduled Jobs" value={String(scheduledJobs ?? 0)} />
        <StatusRow label="Completed Today" value={String(completedToday ?? 0)} />
      </div>
    </PanelCard>
  </div>
</section>

        <section className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <PanelCard title="Recent Activity">
            <div className="space-y-2 text-sm text-slate-600">
              {activity.length === 0 ? (
                <p className="text-slate-400">No recent activity.</p>
              ) : (
                activity.map((ev, i) => (
                  <ActivityItem key={i} text={ev.text} time={timeAgo(ev.ts)} />
                ))
              )}
            </div>
          </PanelCard>

          {/* Payment Snapshot */}
          <PanelCard title="Payment Snapshot">
            <div className="flex flex-col items-center py-4">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle
                  cx="70" cy="70" r="54"
                  fill="none" stroke="#e2e8f0" strokeWidth="14"
                />
                <circle
                  cx="70" cy="70" r="54"
                  fill="none" stroke="#38bdf8" strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 70 70)"
                />
                <text x="70" y="65" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: "22px", fontWeight: "700", fill: "#0f172a" }}>
                  {paidPct}%
                </text>
                <text x="70" y="85" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: "11px", fill: "#64748b" }}>
                  Paid Invoices
                </text>
              </svg>
              <p className="mt-2 text-xs text-slate-400">
                {paidInvoices ?? 0} of {totalInvoices ?? 0} invoices paid
              </p>
            </div>
          </PanelCard>

          {/* Weather */}
         <PanelCard title="Weather">
  {currentCode !== null && currentTemp !== null ? (
    <div className="space-y-4">
      {/* Current conditions */}
      <div
        className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition ${
          weatherType(currentCode) === "sunny"
            ? "bg-gradient-to-br from-amber-50 to-yellow-100"
            : weatherType(currentCode) === "partlyCloudy"
            ? "bg-gradient-to-br from-sky-50 to-blue-100"
            : weatherType(currentCode) === "rain"
            ? "bg-gradient-to-br from-sky-100 to-blue-200"
            : weatherType(currentCode) === "storm"
            ? "bg-gradient-to-br from-slate-200 to-slate-300"
            : weatherType(currentCode) === "snow"
            ? "bg-gradient-to-br from-blue-50 to-slate-100"
            : "bg-gradient-to-br from-slate-50 to-slate-100"
        }`}
      >
        <div className="shrink-0 rounded-2xl bg-white/50 p-2 shadow-sm">
          <WeatherIcon code={currentCode} size={52} />
        </div>

        <div>
          <p className="text-3xl font-bold text-slate-900">
            {currentTemp}°F
          </p>
          <p className="text-sm font-medium text-slate-700">
            {WEATHER_LABELS[currentCode] ?? "Unknown"}
          </p>
          <p className="text-xs text-slate-500">
            {weatherCity}, {weatherState}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Updated from live forecast
          </p>
        </div>
      </div>

      {/* Forecast */}
      {forecast.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {forecast.map((day, i) => (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-3 px-2 transition hover:-translate-y-1 hover:bg-white hover:shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">
                {dayLabel(day.date, i)}
              </p>

              <WeatherIcon code={day.code} size={28} />

              <p className="text-sm font-semibold text-slate-900">
                {day.hi}°
              </p>

              <p className="text-xs text-slate-400">{day.lo}°</p>

              <p className="text-[10px] text-slate-400">
                {day.rainChance}% rain
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className="rounded-2xl bg-slate-100 p-4">
      <p className="font-medium text-slate-800">
        {weatherCity}, {weatherState}
      </p>
      <p className="mt-1 text-sm text-slate-400">Weather unavailable</p>
    </div>
  )}
</PanelCard>
        </section>
      </div>
    </AppShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-transparent" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-emerald-600">
            Tracking this month
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function PanelCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ActionLink({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <Link
      href={href}
      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition active:scale-95 ${color}`}
    >
      {label}
    </Link>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
      <p className="flex-1 leading-snug">{text}</p>
      <span className="shrink-0 text-xs text-slate-400">{time}</span>
    </div>
  );
}

/* 👇 ADD IT RIGHT HERE 👇 */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
  {label}
</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}