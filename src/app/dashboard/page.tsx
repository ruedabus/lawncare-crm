import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";

async function getDashboardStats() {
  return {
    todayJobs: 0,
    openLeads: 0,
    callbacksDue: 0,
    outstandingInvoices: 0,
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Jobs" value={stats.todayJobs} />
        <StatCard label="Open Leads" value={stats.openLeads} />
        <StatCard label="Callbacks Due" value={stats.callbacksDue} />
        <StatCard label="Outstanding Invoices" value={stats.outstandingInvoices} />
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}