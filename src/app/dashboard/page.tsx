import {
  BanknotesIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";

async function getDashboardStats() {
  return {
    totalCustomers: 5,
    activeJobs: 8,
    unpaidInvoices: 2,
    monthlyRevenue: 2450,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = await getDashboardStats();

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Customers"
            value={stats.totalCustomers}
            subtitle="Active customer records"
            icon={<UsersIcon className="h-6 w-6" />}
            color="bg-blue-600"
          />
          <MetricCard
            title="Jobs"
            value={stats.activeJobs}
            subtitle="Open or scheduled jobs"
            icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
            color="bg-violet-600"
          />
          <MetricCard
            title="Unpaid Invoices"
            value={stats.unpaidInvoices}
            subtitle="Invoices awaiting payment"
            icon={<DocumentTextIcon className="h-6 w-6" />}
            color="bg-amber-500"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue}`}
            subtitle="Current month total"
            icon={<BanknotesIcon className="h-6 w-6" />}
            color="bg-emerald-600"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between">
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

            <div className="mt-6 h-72 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Revenue Chart Placeholder
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    We can wire this to live revenue data next.
                  </p>
                </div>

                <div className="grid grid-cols-6 gap-3">
                  {[55, 80, 40, 95, 60, 72].map((height, index) => (
                    <div
                      key={index}
                      className="flex items-end justify-center rounded-xl bg-white p-2"
                    >
                      <div
                        className="w-full rounded-md bg-green-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <PanelCard title="Quick Actions">
              <div className="grid gap-3">
                <ActionButton label="Add Customer" />
                <ActionButton label="Create Job" />
                <ActionButton label="Create Invoice" />
                <ActionButton label="View Schedule" />
              </div>
            </PanelCard>

            <PanelCard title="Today">
              <div className="space-y-4">
                <StatusRow label="Open Invoices" value="2" />
                <StatusRow label="Active Jobs" value="8" />
                <StatusRow label="Scheduled Jobs" value="1" />
                <StatusRow label="Completed Today" value="0" />
              </div>
            </PanelCard>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <PanelCard title="Recent Activity">
            <div className="space-y-3 text-sm text-slate-600">
              <ActivityItem text="Customer added: John Doe" />
              <ActivityItem text="Job updated: Weekly mowing" />
              <ActivityItem text="Invoice created: Lawn mowing invoice" />
            </div>
          </PanelCard>

          <PanelCard title="Payment Snapshot">
            <div className="flex items-center justify-center py-6">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border-8 border-sky-400 text-center">
                <div>
                  <p className="text-3xl font-bold text-slate-900">60%</p>
                  <p className="text-xs text-slate-500">Paid Invoices</p>
                </div>
              </div>
            </div>
          </PanelCard>

          <PanelCard title="Weather / Route Placeholder">
            <div className="space-y-2 text-sm text-slate-600">
              <p>Use this area later for weather, routes, or crew planning.</p>
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="font-medium text-slate-800">Brooksville, FL</p>
                <p className="mt-1 text-slate-500">Sunny, 78°F</p>
              </div>
            </div>
          </PanelCard>
        </section>
      </div>
    </AppShell>
  );
}

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
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex">
        <div className={`flex items-center justify-center px-5 text-white ${color}`}>
          {icon}
        </div>
        <div className="flex-1 p-5">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
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

function ActionButton({ label }: { label: string }) {
  return (
    <button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
      {label}
    </button>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ActivityItem({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p>{text}</p>
    </div>
  );
}