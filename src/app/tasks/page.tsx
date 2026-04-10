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

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  const taskList = (tasks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    due_date: t.due_date,
    status: t.status,
  }));

  const todo = taskList.filter((t) => t.status === "todo").length;
  const inProgress = taskList.filter((t) => t.status === "in_progress").length;
  const done = taskList.filter((t) => t.status === "done").length;

  return (
    <AppShell title="Tasks">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="To Do" value={todo} color="bg-slate-500" />
          <StatCard label="In Progress" value={inProgress} color="bg-blue-600" />
          <StatCard label="Done" value={done} color="bg-emerald-600" />
        </div>

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TasksList tasks={taskList} />
          </div>
          <div>
            <CreateTaskForm />
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
