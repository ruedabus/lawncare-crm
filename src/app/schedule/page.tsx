import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
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

export default async function SchedulePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const [{ data: jobs }, { data: technicians }, { data: customers }] =
    await Promise.all([
      supabase
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
        .eq("user_id", user.id)
        .gte("scheduled_start", weekStart.toISOString())
        .lt("scheduled_start", weekEnd.toISOString())
        .order("scheduled_start", { ascending: true }),

      supabase
        .from("technicians")
        .select("id, name, color, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name", { ascending: true }),

      supabase
        .from("customers")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
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
    customerName:
      (job.customers as { name: string | null } | null)?.name ?? "Unknown",
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
        customers={customerList}
      />
    </AppShell>
  );
}