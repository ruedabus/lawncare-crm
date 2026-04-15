"use client";

import { useState } from "react";

type CreateJobFormProps = {
  customerId: string;
};

const JOB_TEMPLATES = [
  {
    id: "weekly-mowing",
    label: "Weekly Mowing",
    title: "Weekly Mowing",
    notes: "Mow front and back lawn, edge driveway and walkways, blow clippings.",
  },
  {
    id: "hedge-trimming",
    label: "Hedge Trimming",
    title: "Hedge Trimming",
    notes: "Trim hedges, shape shrubs, clean up and haul away clippings.",
  },
  {
    id: "yard-cleanup",
    label: "Yard Cleanup",
    title: "Yard Cleanup",
    notes: "Leaf cleanup, debris removal, weed beds, and final blow-off.",
  },
  {
    id: "mulch-refresh",
    label: "Mulch Refresh",
    title: "Mulch Refresh",
    notes: "Refresh mulch in beds, edge borders, weed and tidy planting areas.",
  },
];

export function CreateJobForm({ customerId }: CreateJobFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [title, setTitle] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function applyTemplate(templateId: string) {
    setSelectedTemplate(templateId);

    const template = JOB_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;

    setTitle(template.title);
    setNotes(template.notes);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          title,
          service_date: serviceDate || null,
          status,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create job.");
        setSaving(false);
        return;
      }

      setSuccessMessage("Job created successfully.");
      setSelectedTemplate("");
      setTitle("");
      setServiceDate("");
      setStatus("scheduled");
      setNotes("");
      window.location.reload();
    } catch {
      setErrorMessage("Unable to create job.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-slate-900">Add Job</h3>
        <p className="mt-1 text-sm text-slate-500">
          Schedule work for this customer and track progress.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Use a Template">
          <select
            value={selectedTemplate}
            onChange={(e) => applyTemplate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Choose a job template (optional)</option>
            {JOB_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Job Title">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="Weekly Mowing"
          />
        </Field>

        <Field label="Service Date">
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </Field>

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Field>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="Any notes for this job"
          />
        </Field>

        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}