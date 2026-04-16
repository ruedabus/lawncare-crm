"use client";

import { useState } from "react";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  status: string;
};

type TasksListProps = {
  tasks: Task[];
};

const TABS = [
  { key: "all", label: "All" },
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

function formatDueDate(value: string | null) {
  if (!value) return "No due date";

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return value;

  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TasksList({ tasks: initial }: TasksListProps) {
  const [tasks, setTasks] = useState(initial);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered =
    activeTab === "all" ? tasks : tasks.filter((t) => t.status === activeTab);

  const counts = TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.key] =
      tab.key === "all"
        ? tasks.length
        : tasks.filter((t) => t.status === tab.key).length;
    return acc;
  }, {});

  async function updateStatus(id: string, status: string) {
    setLoadingId(id);
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoadingId(null);
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    setLoadingId(id);
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setLoadingId(null);
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "-mb-px border border-b-white border-slate-200 bg-white text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Task rows */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No tasks here.
          </div>
        ) : (
          filtered.map((task) => (
            <div key={task.id} className="flex items-start gap-4 px-6 py-4">
              {/* Checkbox to toggle done */}
              <button
                onClick={() =>
                  updateStatus(
                    task.id,
                    task.status === "done" ? "todo" : "done"
                  )
                }
                disabled={loadingId === task.id}
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-300 transition hover:border-slate-900 disabled:opacity-50"
                style={
                  task.status === "done"
                    ? { backgroundColor: "#059669", borderColor: "#059669" }
                    : {}
                }
              >
                {task.status === "done" && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      task.status === "done"
                        ? "text-slate-400 line-through"
                        : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[task.status] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {STATUS_LABELS[task.status] ?? task.status}
                  </span>
                </div>

                <div className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-slate-400">
                  {task.notes ? <span>{task.notes}</span> : null}
                  {task.due_date ? (
                    <span>
  Due{" "}
  {formatDueDate(task.due_date)}
</span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 gap-1">
                {task.status !== "in_progress" && task.status !== "done" && (
                  <button
                    onClick={() => updateStatus(task.id, "in_progress")}
                    disabled={loadingId === task.id}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  >
                    Start
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  disabled={loadingId === task.id}
                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
