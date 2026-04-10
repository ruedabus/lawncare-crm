"use client";

import { useState } from "react";
import Link from "next/link";
import { JobActions } from "./job-actions";

type Job = {
  id: string;
  title: string;
  status: string;
  service_date: string | null;
  notes: string | null;
  customer_id: string;
  customer_name: string | null;
};

type JobsListProps = {
  jobs: Job[];
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function JobsList({ jobs }: JobsListProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all" ? jobs : jobs.filter((j) => j.status === activeTab);

  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.key] =
      tab.key === "all"
        ? jobs.length
        : jobs.filter((j) => j.status === tab.key).length;
    return acc;
  }, {});

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border border-b-white border-slate-200 bg-white text-slate-900 -mb-px"
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

      {/* Job list */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No jobs found.
          </div>
        ) : (
          filtered.map((job) => (
            <div key={job.id} className="px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {job.title || "Untitled Job"}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[job.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {STATUS_LABELS[job.status] ?? job.status}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                    {job.customer_name ? (
                      <Link
                        href={`/customers/${job.customer_id}`}
                        className="hover:text-slate-800 hover:underline"
                      >
                        {job.customer_name}
                      </Link>
                    ) : null}
                    {job.service_date ? (
                      <span>
                        {new Date(job.service_date).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    ) : null}
                    {job.notes ? (
                      <span className="truncate max-w-xs">{job.notes}</span>
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0">
                  <JobActions job={job} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
