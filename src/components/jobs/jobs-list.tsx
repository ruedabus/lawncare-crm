"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { JobActions } from "./job-actions";
import { JobPhotos } from "./job-photos";

type Job = {
  id: string;
  title: string;
  status: string;
  service_date: string | null;
  notes: string | null;
  customer_id: string;
  customer_name: string | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
};

type JobsListProps = {
  jobs: Job[];
  isTechnician?: boolean;
  planName?: string;
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function JobsList({ jobs, isTechnician = false, planName = "basic" }: JobsListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    return STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
      acc[tab.key] =
        tab.key === "all"
          ? jobs.length
          : jobs.filter((job) => job.status === tab.key).length;
      return acc;
    }, {});
  }, [jobs]);

  const filtered = useMemo(() => {
    const statusFiltered =
      activeTab === "all"
        ? jobs
        : jobs.filter((job) => job.status === activeTab);

    const term = search.trim().toLowerCase();

    if (!term) return statusFiltered;

    return statusFiltered.filter((job) => {
      const text = [
        job.title,
        job.customer_name ?? "",
        STATUS_LABELS[job.status] ?? job.status,
        job.notes ?? "",
        job.service_date ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [jobs, activeTab, search]);
  
  function formatServiceDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return value;

  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Jobs
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track scheduled, active, and completed work.
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, customers, notes..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition hover:text-slate-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  🔍
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activeTab === tab.key
                    ? "bg-white/15 text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">No jobs found</p>
            <p className="mt-1 text-sm text-slate-500">
              {isTechnician
                ? "You have no assigned jobs yet. Check back later or contact your dispatcher."
                : "Try changing the status filter or search term."}
            </p>
          </div>
        ) : (
          filtered.map((job) => (
            <div
              key={job.id}
              className="px-6 py-5 transition hover:bg-slate-50/80"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                      {job.title || "Untitled Job"}
                    </h3>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[job.status] ??
                        "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {STATUS_LABELS[job.status] ?? job.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    {job.customer_name ? (
                      <Link
                        href={`/customers/${job.customer_id}`}
                        className="font-medium text-slate-600 transition hover:text-slate-900 hover:underline"
                      >
                        {job.customer_name}
                      </Link>
                    ) : (
                      <span>Unknown customer</span>
                    )}

                    {job.service_date ? (
  <span>{formatServiceDate(job.service_date)}</span>
) : (
  <span>No service date</span>
)}
                  </div>

                  {job.notes ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      {job.notes}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0">
                  <JobActions job={job} isTechnician={isTechnician} />
                </div>
              </div>
              <JobPhotos jobId={job.id} planName={planName} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}