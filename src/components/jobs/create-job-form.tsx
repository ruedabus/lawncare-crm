"use client";

import { useMemo, useState } from "react";

type CreateJobFormProps = {
  customerId: string;
  customerName?: string;
  serviceAddress?: string;
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

type FormErrors = {
  title: string;
  serviceDate: string;
};

export function CreateJobForm({
  customerId,
  customerName,
  serviceAddress,
}: CreateJobFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [title, setTitle] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    title: "",
    serviceDate: "",
  });

  function applyTemplate(templateId: string) {
    setSelectedTemplate(templateId);

    const template = JOB_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;

    setTitle(template.title);
    setNotes(template.notes);

    setErrors((prev) => ({
      ...prev,
      title: "",
    }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  function validateForm(values: { title: string; serviceDate: string }): FormErrors {
    const newErrors: FormErrors = {
      title: "",
      serviceDate: "",
    };

    if (!values.title.trim()) {
      newErrors.title = "Job title is required.";
    }

    if (values.serviceDate) {
      const selected = new Date(`${values.serviceDate}T00:00:00`);
      if (Number.isNaN(selected.getTime())) {
        newErrors.serviceDate = "Please enter a valid service date.";
      }
    }

    return newErrors;
  }

  const isFormValid = useMemo(() => {
    const nextErrors = validateForm({ title, serviceDate });
    return !nextErrors.title && !nextErrors.serviceDate;
  }, [title, serviceDate]);

  function handleCancel() {
    setSelectedTemplate("");
    setTitle("");
    setServiceDate("");
    setStatus("scheduled");
    setNotes("");
    setErrors({
      title: "",
      serviceDate: "",
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = validateForm({ title, serviceDate });
    setErrors(newErrors);
    setErrorMessage("");
    setSuccessMessage("");

    if (newErrors.title || newErrors.serviceDate) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          title: title.trim(),
          service_date: serviceDate || null,
          status,
          notes: notes.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create job.");
        return;
      }

      setSuccessMessage("Job created successfully.");
      handleCancel();
      window.location.reload();
    } catch {
      setErrorMessage("Unable to create job.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          Add Job
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Schedule work for this customer and track progress.
        </p>
      </div>

      {customerName && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">
            Creating job for {customerName}
          </p>
          {serviceAddress ? (
            <p className="mt-1 text-xs text-slate-500">{serviceAddress}</p>
          ) : null}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            onChange={(e) => {
              const value = e.target.value;
              setTitle(value);
              setErrors((prev) => ({
                ...prev,
                ...validateForm({ title: value, serviceDate }),
              }));
              setErrorMessage("");
              setSuccessMessage("");
            }}
            spellCheck={true}
            autoCorrect="on"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              errors.title
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
            }`}
            placeholder="Weekly Mowing"
          />
          {errors.title ? (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          ) : null}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service Date">
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
                setSuccessMessage("");
              }}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                errors.serviceDate
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
              }`}
            />
            {errors.serviceDate ? (
              <p className="mt-1 text-sm text-red-600">{errors.serviceDate}</p>
            ) : null}
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
        </div>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            rows={4}
            spellCheck={true}
            autoCorrect="on"
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

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving || !isFormValid}
            className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create Job"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
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