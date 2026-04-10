import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { LeadsList } from "../../components/leads/leads-list";
import { CreateLeadForm } from "../../components/leads/create-lead-form";

export default async function LeadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leadList = (leads ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    address: l.address,
    source: l.source,
    status: l.status,
    notes: l.notes,
  }));

  const total = leadList.length;
  const newLeads = leadList.filter((l) => l.status === "new").length;
  const qualified = leadList.filter((l) => l.status === "qualified").length;
  const converted = leadList.filter((l) => l.status === "converted").length;

  return (
    <AppShell title="Leads">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Leads" value={total} color="bg-slate-700" />
          <StatCard label="New" value={newLeads} color="bg-blue-600" />
          <StatCard label="Qualified" value={qualified} color="bg-amber-500" />
          <StatCard
            label="Converted"
            value={converted}
            color="bg-emerald-600"
          />
        </div>

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <LeadsList leads={leadList} />
          </div>
          <div>
            <CreateLeadForm />
          </div>
        </div>
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
