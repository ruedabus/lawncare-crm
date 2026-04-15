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
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(job.title ?? "");
  const [serviceDate, setServiceDate] = useState(job.service_date ?? "");
  const [status, setStatus] = useState(job.status ?? "scheduled");
  const [notes, setNotes] = useState(job.notes ?? "");

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

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          service_date: serviceDate || null,
          status,
          notes: notes.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update job.");
        setLoading(false);
        return;
      }

      setIsEditing(false);
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

      {isEditing ? (
        <form
          onSubmit={saveEdit}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Job Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Service Date
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setIsEditing(false);
                setTitle(job.title ?? "");
                setServiceDate(job.service_date ?? "");
                setStatus(job.status ?? "scheduled");
                setNotes(job.notes ?? "");
                setErrorMessage("");
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => setIsEditing((prev) => !prev)}
          className={`${buttonBase} border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100`}
        >
          {isEditing ? "Close Edit" : "Edit Job"}
        </button>

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