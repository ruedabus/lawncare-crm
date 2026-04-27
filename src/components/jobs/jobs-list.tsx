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
  template_id?: string | null;
  template_default_amount?: number | null;
  weather_flagged?: boolean | null;
  weather_flag_reason?: string | null;
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

  // ── Batch invoicing state ────────────────────────────────────────────────────
  const hasBatch = !isTechnician && (planName === "pro" || planName === "premier");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [batchAmounts, setBatchAmounts] = useState<Record<string, string>>({});
  const [batching, setBatching] = useState(false);
  const [batchResult, setBatchResult] = useState<{ created: number; errors: string[] } | null>(null);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function openBatchPanel() {
    // Pre-fill amounts from template defaults
    const amounts: Record<string, string> = {};
    for (const id of selectedIds) {
      const job = jobs.find((j) => j.id === id);
      amounts[id] = job?.template_default_amount ? String(job.template_default_amount) : "";
    }
    setBatchAmounts(amounts);
    setBatchResult(null);
    setShowBatchPanel(true);
  }

  function closeBatchPanel() {
    setShowBatchPanel(false);
    setBatchResult(null);
  }

  async function submitBatch() {
    setBatching(true);
    setBatchResult(null);
    const items = Array.from(selectedIds).map((id) => ({
      jobId: id,
      amount: parseFloat(batchAmounts[id] ?? "0") || 0,
    }));
    try {
      const res = await fetch("/api/invoices/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      setBatchResult(data);
      if (data.created > 0) {
        setSelectedIds(new Set());
      }
    } catch {
      setBatchResult({ created: 0, errors: ["Network error. Please try again."] });
    } finally {
      setBatching(false);
    }
  }

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

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
          {hasBatch && selectedIds.size > 0 && (
            <button
              onClick={openBatchPanel}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Create {selectedIds.size} Invoice{selectedIds.size !== 1 ? "s" : ""}
            </button>
          )}
        </div>
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
          filtered.map((job) => {
            const isCompleted = job.status === "completed";
            const isChecked = selectedIds.has(job.id);
            return (
            <div
              key={job.id}
              className={`px-6 py-5 transition hover:bg-slate-50/80 ${isChecked ? "bg-emerald-50/60" : ""}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {hasBatch && isCompleted && (
                  <div className="flex shrink-0 items-center pr-2 pt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(job.id)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                )}
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
                    {job.weather_flagged && (
                      <span
                        title={job.weather_flag_reason ?? "Weather alert"}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
                      >
                        ⛈️ Weather alert
                      </span>
                    )}
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
            );
          })
        )}
      </div>

      {/* ── Batch invoice panel ──────────────────────────────────────────────── */}
      {showBatchPanel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Create {selectedIds.size} Invoice{selectedIds.size !== 1 ? "s" : ""}
              </h2>
              <button onClick={closeBatchPanel} className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {batchResult ? (
              <div className="px-6 py-8 text-center">
                {batchResult.created > 0 ? (
                  <>
                    <div className="mb-3 text-4xl">✅</div>
                    <p className="text-lg font-semibold text-slate-900">
                      {batchResult.created} invoice{batchResult.created !== 1 ? "s" : ""} created!
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Head to Invoices to review and send them.</p>
                    {batchResult.errors.length > 0 && (
                      <p className="mt-2 text-xs text-amber-600">{batchResult.errors.length} job(s) had errors.</p>
                    )}
                    <div className="mt-6 flex gap-3 justify-center">
                      <a href="/invoices" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500">
                        View Invoices →
                      </a>
                      <button onClick={closeBatchPanel} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Done
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 text-4xl">⚠️</div>
                    <p className="text-base font-semibold text-slate-900">Something went wrong</p>
                    <ul className="mt-2 text-sm text-red-600 space-y-1">
                      {batchResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                    <button onClick={() => setBatchResult(null)} className="mt-4 text-sm text-emerald-600 hover:underline">Try again</button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100 px-6 py-2">
                  {Array.from(selectedIds).map((jobId) => {
                    const job = jobs.find((j) => j.id === jobId);
                    if (!job) return null;
                    return (
                      <div key={jobId} className="flex items-center gap-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{job.title}</p>
                          <p className="text-xs text-slate-500">{job.customer_name ?? "Unknown customer"}</p>
                        </div>
                        <div className="relative w-28 shrink-0">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={batchAmounts[jobId] ?? ""}
                            onChange={(e) => setBatchAmounts((prev) => ({ ...prev, [jobId]: e.target.value }))}
                            className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="px-6 pb-2 text-xs text-slate-400">
                  Invoices are created as <strong>unpaid</strong>. Edit individual amounts before sending.
                </p>
                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                  <button
                    onClick={submitBatch}
                    disabled={batching}
                    className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {batching ? "Creating…" : `Create ${selectedIds.size} Invoice${selectedIds.size !== 1 ? "s" : ""}`}
                  </button>
                  <button
                    onClick={closeBatchPanel}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}