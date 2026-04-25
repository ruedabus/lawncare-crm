import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { EstimatesList } from "../../components/estimates/estimates-list";
import { CreateEstimateForm } from "../../components/estimates/create-estimate-form";
import { getUserPlanInfo } from "../../lib/plan-guard";
import { UpgradeWall } from "../../components/plan/upgrade-wall";

export default async function EstimatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { config, planName } = await getUserPlanInfo();
  if (!config.estimates) {
    return (
      <AppShell title="Estimates">
        <UpgradeWall
          feature="Estimates"
          description="Create and send professional quotes to customers before converting them into jobs. Available on Pro and Premier plans."
          currentPlan={planName}
        />
      </AppShell>
    );
  }

  const [{ data: estimatesRaw }, { data: customers }] = await Promise.all([
    supabase
      .from("estimates")
      .select("*, customers(id, name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("customers")
      .select("id, name")
      .order("name"),
  ]);

  const estimates = (estimatesRaw ?? []).map((e) => ({
    ...e,
    customer_name: (e.customers as { name: string } | null)?.name ?? null,
  }));

  const total = estimates.length;
  const draft = estimates.filter((e) => e.status === "draft").length;
  const sent = estimates.filter((e) => e.status === "sent").length;
  const approved = estimates.filter((e) => e.status === "approved").length;
  const totalValue = estimates.reduce((s, e) => s + Number(e.total ?? 0), 0);

  return (
    <AppShell title="Estimates">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Estimates" value={total} color="bg-slate-700" />
          <StatCard label="Drafts" value={draft} color="bg-amber-500" />
          <StatCard label="Awaiting Response" value={sent} color="bg-sky-500" />
          <StatCard label="Approved" value={approved} color="bg-emerald-600" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">All Estimates</h2>
            <p className="text-sm text-slate-500">
              Total pipeline value: <span className="font-medium text-slate-700">${totalValue.toFixed(2)}</span>
            </p>
          </div>
          <CreateEstimateForm customers={customers ?? []} planName={planName} />
        </div>

        <EstimatesList estimates={estimates} />
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
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
