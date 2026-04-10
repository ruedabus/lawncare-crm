import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";

type ScheduledJob = {
  id: string;
  title: string;
  status: string;
  service_date: string;
  notes: string | null;
  customer_id: string;
  customer_name: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDateHeading(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SchedulePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, customers(id, name)")
    .not("service_date", "is", null)
    .order("service_date", { ascending: true });

  const allJobs: ScheduledJob[] = (jobs ?? []).map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    service_date: job.service_date,
    notes: job.notes,
    customer_id: job.customer_id,
    customer_name:
      (job.customers as { name: string | null } | null)?.name ?? null,
  }));

  const today = new Date().toISOString().split("T")[0];

  const upcoming = allJobs.filter((j) => j.service_date >= today);
  const past = allJobs.filter((j) => j.service_date < today);

  // Group upcoming jobs by date
  const groupedUpcoming = upcoming.reduce<Record<string, ScheduledJob[]>>(
    (acc, job) => {
      if (!acc[job.service_date]) acc[job.service_date] = [];
      acc[job.service_date].push(job);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(groupedUpcoming).sort();

  return (
    <AppShell title="Schedule">
      <div className="space-y-8">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Upcoming Jobs"
            value={upcoming.length}
            color="bg-blue-600"
          />
          <StatCard
            label="Scheduled Today"
            value={
              upcoming.filter((j) => j.service_date === today).length
            }
            color="bg-emerald-600"
          />
          <StatCard
            label="Past Jobs"
            value={past.length}
            color="bg-slate-400"
          />
        </div>

        {/* Upcoming schedule */}
        {sortedDates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No upcoming scheduled jobs.</p>
            <p className="mt-1 text-sm text-slate-400">
              Add a service date to a job to see it here.
            </p>
            <Link
              href="/jobs"
              className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Go to Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <section key={date}>
                <div className="mb-3 flex items-center gap-3">
                  <h2
                    className={`text-base font-semibold ${
                      date === today ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    {formatDateHeading(date)}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    {groupedUpcoming[date].length}{" "}
                    {groupedUpcoming[date].length === 1 ? "job" : "jobs"}
                  </span>
                  {date === today && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Today
                    </span>
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="divide-y divide-slate-100">
                    {groupedUpcoming[date].map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {job.title}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                STATUS_STYLES[job.status] ??
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {STATUS_LABELS[job.status] ?? job.status}
                            </span>
                          </div>
                          {job.customer_name ? (
                            <Link
                              href={`/customers/${job.customer_id}`}
                              className="mt-0.5 text-xs text-slate-500 hover:text-slate-800 hover:underline"
                            >
                              {job.customer_name}
                            </Link>
                          ) : null}
                          {job.notes ? (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {job.notes}
                            </p>
                          ) : null}
                        </div>

                        <Link
                          href={`/customers/${job.customer_id}`}
                          className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View Customer
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Past jobs (collapsed) */}
        {past.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600">
                <svg
                  className="h-4 w-4 transition group-open:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Past jobs ({past.length})
              </div>
            </summary>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {past
                  .slice()
                  .reverse()
                  .map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col gap-1 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-slate-500 line-through">
                            {job.title}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              STATUS_STYLES[job.status] ??
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {STATUS_LABELS[job.status] ?? job.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {job.customer_name ?? ""} ·{" "}
                          {new Date(
                            job.service_date + "T00:00:00"
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </details>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex">
        <div className={`w-2 shrink-0 ${color}`} />
        <div className="flex-1 p-5">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
