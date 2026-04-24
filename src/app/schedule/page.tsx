import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getTeamContext } from "../../lib/team";
import { AppShell } from "../../components/layout/app-shell";
import { WeekSchedule } from "../../components/schedule/week-schedule";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 7);
  return d;
}

type SchedulePageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

export default async function SchedulePage({
  searchParams,
}: SchedulePageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const { ownerId, role } = await getTeamContext(supabase, user.id);
  const isTechnician = role === "technician";

  // Find the technician record for the logged-in user so we can scope the schedule
  let assignedTechnicianId: string | null = null;
  if (isTechnician) {
    const { data: tech } = await supabase
      .from("technicians")
      .select("id")
      .eq("user_id", ownerId)
      .eq("email", user.email ?? "")
      .maybeSingle();
    assignedTechnicianId = tech?.id ?? null;
  }

  const params = await searchParams;
  const selectedDate = params?.date
    ? new Date(`${params.date}T12:00:00`)
    : new Date();

  const baseDate =
    Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate;

  const weekStart = startOfWeek(baseDate);
  const weekEnd = endOfWeek(baseDate);

  // Build the jobs query — scope to assigned technician if applicable
  let jobsQuery = supabase
    .from("jobs")
    .select(
      `
        id,
        title,
        status,
        notes,
        scheduled_start,
        scheduled_end,
        technician_id,
        customer_id,
        customers(name)
      `
    )
    .eq("user_id", ownerId)
    .gte("scheduled_start", weekStart.toISOString())
    .lt("scheduled_start", weekEnd.toISOString())
    .order("scheduled_start", { ascending: true });

  if (isTechnician) {
    jobsQuery = assignedTechnicianId
      ? jobsQuery.eq("technician_id", assignedTechnicianId)
      : jobsQuery.eq("technician_id", "00000000-0000-0000-0000-000000000000");
  }

  // Technicians list — scope to just the logged-in tech so the calendar only
  // shows their own row, not the full crew
  let techniciansQuery = supabase
    .from("technicians")
    .select("id, name, color, is_active")
    .eq("user_id", ownerId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (isTechnician && assignedTechnicianId) {
    techniciansQuery = techniciansQuery.eq("id", assignedTechnicianId);
  }

  const [
    { data: jobs },
    { data: technicians },
    { data: customers },
    { data: tasks },
  ] = await Promise.all([
    jobsQuery,
    techniciansQuery,

    supabase
      .from("customers")
      .select("id, name")
      .eq("user_id", ownerId)
      .order("name", { ascending: true }),

    supabase
      .from("tasks")
      .select(
        `
          id,
          title,
          notes,
          status,
          due_date,
          scheduled_start,
          scheduled_end,
          assigned_to
        `
      )
      .eq("user_id", ownerId)
      .not("scheduled_start", "is", null)
      .gte("scheduled_start", weekStart.toISOString())
      .lt("scheduled_start", weekEnd.toISOString())
      .order("scheduled_start", { ascending: true }),
  ]);

  const scheduleJobs = (jobs ?? []).map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    notes: job.notes,
    scheduledStart: job.scheduled_start,
    scheduledEnd: job.scheduled_end,
    technicianId: job.technician_id,
    customerId: job.customer_id,
    customerName: Array.isArray(job.customers)
      ? job.customers[0]?.name ?? "Unknown"
      : "Unknown",
  }));

  const scheduleTasks = (tasks ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    notes: task.notes,
    scheduledStart: task.scheduled_start,
    scheduledEnd: task.scheduled_end,
    technicianId: task.assigned_to,
    dueDate: task.due_date,
    type: "task" as const,
  }));

  const techs = (technicians ?? []).map((tech) => ({
    id: tech.id,
    name: tech.name,
    color: tech.color || "#2563eb",
  }));

  const customerList = (customers ?? []).map((customer) => ({
    id: customer.id,
    name: customer.name,
  }));

  return (
    <AppShell title="Schedule">
      <WeekSchedule
        technicians={techs}
        jobs={scheduleJobs}
        tasks={scheduleTasks}
        customers={customerList}
        selectedDate={baseDate.toISOString()}
      />
    </AppShell>
  );
}