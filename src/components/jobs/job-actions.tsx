"use client";

import { useState } from "react";

type Job = {
  id: string;
  title: string;
  service_date: string | null;
  status: string;
  notes: string | null;
};

type JobActionsProps = {
  job: Job;
};

export function JobActions({ job }: JobActionsProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function updateStatus(newStatus: string) {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: job.title,
          service_date: job.service_date,
          status: newStatus,
          notes: job.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update job.");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setErrorMessage("Unable to update job.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteJob() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}"?`
    );

    if (!confirmed) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to delete job.");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setErrorMessage("Unable to delete job.");
    } finally {
      setLoading(false);
    }
  }

  const buttonBase =
    "rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-60";

  return (
    <div className="mt-4 space-y-3">
      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("scheduled")}
          className={`${buttonBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
        >
          Scheduled
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("in_progress")}
          className={`${buttonBase} border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        >
          In Progress
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("completed")}
          className={`${buttonBase} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
        >
          Completed
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("cancelled")}
          className={`${buttonBase} border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
        >
          Cancelled
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={deleteJob}
          className={`${buttonBase} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
        >
          Delete Job
        </button>
      </div>
    </div>
  );
}