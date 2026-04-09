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

    if (!confirmed) {
      return;
    }

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

  return (
    <div className="mt-3 space-y-3">
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("scheduled")}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:opacity-60"
        >
          Scheduled
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("in_progress")}
          className="rounded-lg border border-blue-300 px-3 py-1 text-sm text-blue-700 disabled:opacity-60"
        >
          In Progress
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("completed")}
          className="rounded-lg border border-green-300 px-3 py-1 text-sm text-green-700 disabled:opacity-60"
        >
          Completed
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("cancelled")}
          className="rounded-lg border border-yellow-300 px-3 py-1 text-sm text-yellow-700 disabled:opacity-60"
        >
          Cancelled
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={deleteJob}
          className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700 disabled:opacity-60"
        >
          Delete Job
        </button>
      </div>
    </div>
  );
}