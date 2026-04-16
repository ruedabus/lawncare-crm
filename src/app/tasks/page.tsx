import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { TasksList } from "../../components/tasks/tasks-list";
import { CreateTaskForm } from "../../components/tasks/create-task-form";

export default async function TasksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: tasks }, { data: technicians }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("technicians")
      .select("id, name, color, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const taskList = (tasks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    due_date: t.due_date,
    status: t.status,
    assigned_to: t.assigned_to,
    scheduled_start: t.scheduled_start,
    scheduled_end: t.scheduled_end,
  }));

  const technicianList = (technicians ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }));

  const todo = taskList.filter((t) => t.status === "todo").length;
  const inProgress = taskList.filter((t) => t.status === "in_progress").length;
  const done = taskList.filter((t) => t.status === "done").length;

  return (
    <AppShell title="Tasks">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="To Do" value={todo} color="bg-slate-500" />
          <StatCard label="In Progress" value={inProgress} color="bg-blue-600" />
          <StatCard label="Done" value={done} color="bg-emerald-600" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TasksList tasks={taskList} />
          </div>
          <div>
            <CreateTaskForm technicians={technicianList} />
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