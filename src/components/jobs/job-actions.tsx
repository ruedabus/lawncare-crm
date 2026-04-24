"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  title: string;
  service_date: string | null;
  status: string;
  notes: string | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
};

type JobActionsProps = {
  job: Job;
  isTechnician?: boolean;
};

type FormErrors = {
  title: string;
  serviceDate: string;
};

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const QUICK_STATUS_STYLES: Record<string, string> = {
  scheduled:
    "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
  in_progress:
    "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  cancelled:
    "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
};

function buildShiftedDateTime(
  originalIso: string | null | undefined,
  nextServiceDate: string | null
) {
  if (!originalIso || !nextServiceDate) return null;

  const original = new Date(originalIso);
  if (Number.isNaN(original.getTime())) return null;

  const [year, month, day] = nextServiceDate.split("-").map(Number);
  if (!year || !month || !day) return null;

  const shifted = new Date(original);
  shifted.setFullYear(year, month - 1, day);

  return shifted.toISOString();
}

export function JobActions({ job, isTechnician = false }: JobActionsProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState(job.title ?? "");
  const [serviceDate, setServiceDate] = useState(job.service_date ?? "");
  const [status, setStatus] = useState(job.status ?? "scheduled");
  const [notes, setNotes] = useState(job.notes ?? "");
  const [errors, setErrors] = useState<FormErrors>({
    title: "",
    serviceDate: "",
  });

  function validateForm(values: {
    title: string;
    serviceDate: string;
  }): FormErrors {
    const newErrors: FormErrors = {
      title: "",
      serviceDate: "",
    };

    if (!values.title.trim()) {
      newErrors.title = "Job title is required.";
    }

    if (values.serviceDate) {
      const parsed = new Date(`${values.serviceDate}T12:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        newErrors.serviceDate = "Please enter a valid service date.";
      }
    }

    return newErrors;
  }

  function resetEditState() {
    setTitle(job.title ?? "");
    setServiceDate(job.service_date ?? "");
    setStatus(job.status ?? "scheduled");
    setNotes(job.notes ?? "");
    setErrors({
      title: "",
      serviceDate: "",
    });
    setErrorMessage("");
    setIsEditing(false);
  }

  async function updateStatus(newStatus: string) {
    if (loading || newStatus === job.status) return;

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
          scheduled_start: job.scheduled_start ?? null,
          scheduled_end: job.scheduled_end ?? null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update job.");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Unable to update job.");
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = validateForm({ title, serviceDate });
    setErrors(newErrors);
    setErrorMessage("");

    if (newErrors.title || newErrors.serviceDate) {
      return;
    }

    setLoading(true);

    try {
      const nextServiceDate = serviceDate || null;

      const nextScheduledStart = buildShiftedDateTime(
        job.scheduled_start,
        nextServiceDate
      );

      const nextScheduledEnd = buildShiftedDateTime(
        job.scheduled_end,
        nextServiceDate
      );

      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          service_date: nextServiceDate,
          status,
          notes: notes.trim() || null,
          scheduled_start: nextScheduledStart,
          scheduled_end: nextScheduledEnd,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update job.");
        return;
      }

      setIsEditing(false);
      router.refresh();
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
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Unable to delete job.");
    } finally {
      setLoading(false);
    }
  }

  const actionButtonBase =
    "inline-flex items-center rounded-xl border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="w-full space-y-3 lg:w-auto">
      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isEditing ? (
        <form
          onSubmit={saveEdit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Job Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                const value = e.target.value;
                setTitle(value);
                setErrors((prev) => ({
                  ...prev,
                  ...validateForm({ title: value, serviceDate }),
                }));
                setErrorMessage("");
              }}
              spellCheck={true}
              autoCorrect="on"
              className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
              }`}
            />
            {errors.title ? (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Service Date
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setServiceDate(value);
                  setErrors((prev) => ({
                    ...prev,
                    ...validateForm({ title, serviceDate: value }),
                  }));
                  setErrorMessage("");
                }}
                className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  errors.serviceDate
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                }`}
              />
              {errors.serviceDate ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.serviceDate}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setErrorMessage("");
              }}
              rows={4}
              spellCheck={true}
              autoCorrect="on"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={resetEditState}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {/* Edit and Delete are owner/admin only */}
        {!isTechnician && (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setIsEditing((prev) => !prev);
              setErrorMessage("");
              if (isEditing) {
                resetEditState();
              }
            }}
            className={`${actionButtonBase} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
          >
            {isEditing ? "Close Edit" : "Edit"}
          </button>
        )}

        {STATUS_OPTIONS.map((option) => {
          const isCurrent = job.status === option.value;
          // Technicians can only mark In Progress or Completed
          if (isTechnician && !["in_progress", "completed"].includes(option.value)) return null;

          return (
            <button
              key={option.value}
              type="button"
              disabled={loading || isCurrent}
              onClick={() => updateStatus(option.value)}
              className={`${actionButtonBase} ${
                QUICK_STATUS_STYLES[option.value]
              } ${isCurrent ? "opacity-50" : ""}`}
            >
              {option.label}
            </button>
          );
        })}

        {!isTechnician && (
          <button
            type="button"
            disabled={loading}
            onClick={deleteJob}
            className={`${actionButtonBase} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}