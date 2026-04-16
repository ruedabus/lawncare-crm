import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { JobsList } from "../../components/jobs/jobs-list";
import { CreateJobFormGlobal } from "../../components/jobs/create-job-form-global";

export default async function JobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: jobs, error: jobsError },
    { data: customers, error: customersError },
    { data: technicians, error: techniciansError },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select(`
        id,
        title,
        status,
        service_date,
        notes,
        customer_id,
        scheduled_start,
        scheduled_end,
        customers(id, name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("customers")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),

    supabase
      .from("technicians")
      .select("id, name, color, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  // Debug logs (optional)
  console.log("TECHNICIANS ERROR:", techniciansError);
  console.log("TECHNICIANS DATA:", technicians);

  const jobList = (jobs ?? []).map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    service_date: job.service_date,
    notes: job.notes,
    customer_id: job.customer_id,
    customer_name:
      (job.customers as { name: string | null } | null)?.name ?? null,
    scheduled_start: job.scheduled_start,
    scheduled_end: job.scheduled_end,
  }));

  const customerList = (customers ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const technicianList = (technicians ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }));

  const total = jobList.length;
  const scheduled = jobList.filter((j) => j.status === "scheduled").length;
  const inProgress = jobList.filter((j) => j.status === "in_progress").length;
  const completed = jobList.filter((j) => j.status === "completed").length;

  return (
    <AppShell title="Jobs">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Jobs" value={total} color="bg-slate-700" />
          <StatCard label="Scheduled" value={scheduled} color="bg-slate-500" />
          <StatCard
            label="In Progress"
            value={inProgress}
            color="bg-blue-600"
          />
          <StatCard
            label="Completed"
            value={completed}
            color="bg-emerald-600"
          />
        </div>

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <JobsList jobs={jobList} />
          </div>

          <div>
            <CreateJobFormGlobal
              customers={customerList}
              technicians={technicianList}
            />
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