import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { getUserPlanInfo } from "../../lib/plan-guard";
import { UpgradeWall } from "../../components/plan/upgrade-wall";

// ── Types ────────────────────────────────────────────────────────────────────

type Invoice = {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  customer_name: string | null;
};

type Job = {
  id: string;
  status: string;
  created_at: string;
};

type MonthData = {
  month: string;
  date: Date;
  value: number;
};

type CustomerRevenue = {
  name: string;
  total: number;
  count: number;
};

// ── Helper: Format month label ──────────────────────────────────────────────

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// ── Helper: Get start of month ──────────────────────────────────────────────

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// ── Helper: Group by month ──────────────────────────────────────────────────

function groupByMonth(dates: string[]): string[] {
  const months = new Set<string>();
  dates.forEach((dateStr) => {
    const date = new Date(dateStr);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.add(key);
  });
  return Array.from(months).sort();
}

// ── Helper: Get last 6 months ──────────────────────────────────────────────

function getLastSixMonths(): MonthData[] {
  const months: MonthData[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      month: getMonthLabel(date),
      date: getMonthStart(date),
      value: 0,
    });
  }
  return months;
}

// ── Helper: Get this month and last month dates ──────────────────────────────

function getMonthDateRanges(): {
  thisMonthStart: Date;
  thisMonthEnd: Date;
  lastMonthStart: Date;
  lastMonthEnd: Date;
} {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return { thisMonthStart, thisMonthEnd, lastMonthStart, lastMonthEnd };
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { config, planName } = await getUserPlanInfo();
  if (!config.reports) {
    return (
      <AppShell title="Reports">
        <UpgradeWall
          feature="Reports"
          description="Get detailed revenue breakdowns, job completion rates, and top customer insights. Available on Pro and Premier plans."
          currentPlan={planName}
        />
      </AppShell>
    );
  }

  // ── Fetch data ──────────────────────────────────────────────────────────

  const [
    { data: paidInvoices, error: paidError },
    { data: allInvoices, error: invoicesError },
    { data: allJobs, error: jobsError },
    { count: customerCount, error: customerError },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, amount, created_at")
      .eq("status", "paid"),
    supabase
      .from("invoices")
      .select("amount, status, customers(id, name)"),
    supabase
      .from("jobs")
      .select("id, status, created_at"),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true }),
  ]);

  // ── Process paid invoices ───────────────────────────────────────────────

  const typedPaidInvoices: Invoice[] = (paidInvoices ?? []).map((inv) => ({
    id: inv.id,
    amount: Number(inv.amount) || 0,
    created_at: inv.created_at,
    status: "paid",
    customer_name: null,
  }));

  const totalRevenue = typedPaidInvoices.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const avgInvoiceValue =
    typedPaidInvoices.length > 0
      ? totalRevenue / typedPaidInvoices.length
      : 0;

  // ── Process all invoices with customer join ─────────────────────────────

  type RawInvoice = {
    amount: number | null;
    status: string;
    customers: { id: string; name: string | null } | null;
  };

  const typedAllInvoices: RawInvoice[] = (allInvoices ?? []) as unknown as RawInvoice[];

  // ── Process jobs ────────────────────────────────────────────────────────

  const typedJobs: Job[] = (allJobs ?? []).map((job) => ({
    id: job.id,
    status: job.status,
    created_at: job.created_at,
  }));

  const completedJobsCount = typedJobs.filter(
    (j) => j.status === "completed"
  ).length;

  // ── Revenue by month (last 6 months) ────────────────────────────────────

  const monthlyRevenue = getLastSixMonths();
  typedPaidInvoices.forEach((inv) => {
    const invDate = new Date(inv.created_at);
    const monthIndex = monthlyRevenue.findIndex(
      (m) =>
        m.date.getFullYear() === invDate.getFullYear() &&
        m.date.getMonth() === invDate.getMonth()
    );
    if (monthIndex >= 0) {
      monthlyRevenue[monthIndex].value += inv.amount;
    }
  });

  const maxMonthlyRevenue = Math.max(
    ...monthlyRevenue.map((m) => m.value),
    1
  );

  // ── Top 5 customers by revenue ──────────────────────────────────────────

  const customerRevenueMap = new Map<string, CustomerRevenue>();
  typedAllInvoices.forEach((inv) => {
    if (inv.status === "paid" && inv.customers?.name) {
      const name = inv.customers.name;
      const amount = Number(inv.amount) || 0;
      const existing = customerRevenueMap.get(name) || {
        name,
        total: 0,
        count: 0,
      };
      existing.total += amount;
      existing.count += 1;
      customerRevenueMap.set(name, existing);
    }
  });

  const topCustomers = Array.from(customerRevenueMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxCustomerRevenue = Math.max(
    ...topCustomers.map((c) => c.total),
    1
  );

  // ── Jobs breakdown (this month vs last month) ───────────────────────────

  const { thisMonthStart, thisMonthEnd, lastMonthStart, lastMonthEnd } =
    getMonthDateRanges();

  const jobStatuses = [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const jobBreakdown: Record<
    string,
    { thisMonth: number; lastMonth: number }
  > = {};

  jobStatuses.forEach((status) => {
    const thisMonthJobs = typedJobs.filter((j) => {
      const jDate = new Date(j.created_at);
      return (
        j.status === status &&
        jDate >= thisMonthStart &&
        jDate <= thisMonthEnd
      );
    }).length;

    const lastMonthJobs = typedJobs.filter((j) => {
      const jDate = new Date(j.created_at);
      return (
        j.status === status &&
        jDate >= lastMonthStart &&
        jDate <= lastMonthEnd
      );
    }).length;

    jobBreakdown[status] = { thisMonth: thisMonthJobs, lastMonth: lastMonthJobs };
  });

  // ── Monthly jobs completed (last 6 months) ──────────────────────────────

  const monthlyJobsCompleted = getLastSixMonths();
  typedJobs.forEach((job) => {
    if (job.status === "completed") {
      const jobDate = new Date(job.created_at);
      const monthIndex = monthlyJobsCompleted.findIndex(
        (m) =>
          m.date.getFullYear() === jobDate.getFullYear() &&
          m.date.getMonth() === jobDate.getMonth()
      );
      if (monthIndex >= 0) {
        monthlyJobsCompleted[monthIndex].value += 1;
      }
    }
  });

  const maxMonthlyJobs = Math.max(
    ...monthlyJobsCompleted.map((m) => m.value),
    1
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <AppShell title="Reports">
      <div className="space-y-6">
        {/* Top stats row */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={`$${totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            color="bg-emerald-600"
          />
          <StatCard
            label="Jobs Completed"
            value={completedJobsCount}
            color="bg-blue-600"
          />
          <StatCard
            label="Total Customers"
            value={customerCount ?? 0}
            color="bg-violet-600"
          />
          <StatCard
            label="Avg Invoice Value"
            value={`$${avgInvoiceValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            color="bg-amber-500"
          />
        </section>

        {/* Revenue by month chart */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Revenue by Month (Last 6 Months)
          </h3>
          {monthlyRevenue.every((m) => m.value === 0) ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No revenue data available</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {monthlyRevenue.map((month) => {
                const percentage =
                  maxMonthlyRevenue > 0
                    ? (month.value / maxMonthlyRevenue) * 100
                    : 0;
                return (
                  <div key={month.month} className="flex items-center gap-4">
                    <div className="w-16 shrink-0 text-right">
                      <p className="text-xs font-medium text-slate-600">
                        {month.month}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="h-6 rounded-md bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-900">
                        ${month.value.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Top 5 customers */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Top 5 Customers by Revenue
          </h3>
          {topCustomers.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No customer data available</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {topCustomers.map((customer, index) => {
                const percentage =
                  maxCustomerRevenue > 0
                    ? (customer.total / maxCustomerRevenue) * 100
                    : 0;
                return (
                  <div key={customer.name} className="space-y-1">
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {index + 1}. {customer.name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900">
                          ${customer.total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {customer.count} invoice{customer.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Jobs breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Jobs Breakdown (This Month vs Last Month)
          </h3>
          {Object.values(jobBreakdown).every((b) => b.thisMonth === 0 && b.lastMonth === 0) ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No job data available</p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-semibold text-slate-900 pb-3">
                      Status
                    </th>
                    <th className="text-center font-semibold text-slate-900 pb-3">
                      This Month
                    </th>
                    <th className="text-center font-semibold text-slate-900 pb-3">
                      Last Month
                    </th>
                    <th className="text-center font-semibold text-slate-900 pb-3">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobStatuses.map((status) => {
                    const breakdown = jobBreakdown[status] || {
                      thisMonth: 0,
                      lastMonth: 0,
                    };
                    const change = breakdown.thisMonth - breakdown.lastMonth;
                    const changeColor =
                      change > 0
                        ? "text-green-600"
                        : change < 0
                          ? "text-red-600"
                          : "text-slate-600";

                    return (
                      <tr key={status} className="border-b border-slate-100">
                        <td className="py-3 pr-4">
                          <StatusBadge status={status} />
                        </td>
                        <td className="text-center py-3">
                          <span className="font-semibold text-slate-900">
                            {breakdown.thisMonth}
                          </span>
                        </td>
                        <td className="text-center py-3">
                          <span className="text-slate-600">
                            {breakdown.lastMonth}
                          </span>
                        </td>
                        <td className={`text-center py-3 font-semibold ${changeColor}`}>
                          {change > 0 ? "+" : ""}{change}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Monthly jobs completed chart */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Jobs Completed by Month (Last 6 Months)
          </h3>
          {monthlyJobsCompleted.every((m) => m.value === 0) ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No job completion data available</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {monthlyJobsCompleted.map((month) => {
                const percentage =
                  maxMonthlyJobs > 0 ? (month.value / maxMonthlyJobs) * 100 : 0;
                return (
                  <div key={month.month} className="flex items-center gap-4">
                    <div className="w-16 shrink-0 text-right">
                      <p className="text-xs font-medium text-slate-600">
                        {month.month}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="h-6 rounded-md bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-900">
                        {month.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex">
        <div className={`flex items-center justify-center px-5 text-white ${color}`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1 p-5">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: "bg-blue-100", text: "text-blue-700" },
    in_progress: { bg: "bg-yellow-100", text: "text-yellow-700" },
    completed: { bg: "bg-green-100", text: "text-green-700" },
    cancelled: { bg: "bg-red-100", text: "text-red-700" },
  };

  const color = colors[status] || colors.scheduled;
  const label = status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${color.bg} ${color.text}`}>
      {label}
    </span>
  );
}
