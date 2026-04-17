"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  name: string | null;
};

type Technician = {
  id: string;
  name: string;
  color?: string | null;
};

type CreateJobFormGlobalProps = {
  customers: Customer[];
  technicians: Technician[];
};

type FormErrors = {
  customerId: string;
  title: string;
  serviceDate: string;
  scheduledStart: string;
  scheduledEnd: string;
};

export function CreateJobFormGlobal({
  customers,
  technicians,
}: CreateJobFormGlobalProps) {
  const router = useRouter();

  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerResults, setShowCustomerResults] = useState(false);

  const [technicianId, setTechnicianId] = useState("");
  const [title, setTitle] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState<string | number>(1);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    customerId: "",
    title: "",
    serviceDate: "",
    scheduledStart: "",
    scheduledEnd: "",
  });

  const normalizedCustomers = useMemo(
    () =>
      customers.map((customer) => ({
        id: customer.id,
        name: customer.name?.trim() || "Unnamed",
      })),
    [customers]
  );

  const selectedCustomer = normalizedCustomers.find((c) => c.id === customerId);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();

    if (!term) return normalizedCustomers.slice(0, 8);

    return normalizedCustomers
      .filter((customer) => customer.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [normalizedCustomers, customerSearch]);

  function validateForm(values: {
    customerId: string;
    title: string;
    serviceDate: string;
    scheduledStart: string;
    scheduledEnd: string;
  }): FormErrors {
    const newErrors: FormErrors = {
      customerId: "",
      title: "",
      serviceDate: "",
      scheduledStart: "",
      scheduledEnd: "",
    };

    if (!values.customerId) {
      newErrors.customerId = "Please select a customer.";
    }

    if (!values.title.trim()) {
      newErrors.title = "Job title is required.";
    }

    if (values.serviceDate) {
      const parsed = new Date(`${values.serviceDate}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        newErrors.serviceDate = "Please enter a valid service date.";
      }
    }

    if (
      values.scheduledStart &&
      Number.isNaN(new Date(values.scheduledStart).getTime())
    ) {
      newErrors.scheduledStart = "Please enter a valid start time.";
    }

    if (
      values.scheduledEnd &&
      Number.isNaN(new Date(values.scheduledEnd).getTime())
    ) {
      newErrors.scheduledEnd = "Please enter a valid end time.";
    }

    if (values.scheduledStart && values.scheduledEnd) {
      const start = new Date(values.scheduledStart);
      const end = new Date(values.scheduledEnd);

      if (end <= start) {
        newErrors.scheduledEnd = "End time must be after start time.";
      }
    }

    return newErrors;
  }

  const isFormValid = useMemo(() => {
    const nextErrors = validateForm({
      customerId,
      title,
      serviceDate,
      scheduledStart,
      scheduledEnd,
    });

    return (
      !nextErrors.customerId &&
      !nextErrors.title &&
      !nextErrors.serviceDate &&
      !nextErrors.scheduledStart &&
      !nextErrors.scheduledEnd
    );
  }, [customerId, title, serviceDate, scheduledStart, scheduledEnd]);

  function handleCustomerSelect(selectedId: string, selectedName: string) {
    setCustomerId(selectedId);
    setCustomerSearch(selectedName);
    setShowCustomerResults(false);
    setErrors((prev) => ({
      ...prev,
      customerId: "",
    }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleCancel() {
    setCustomerId("");
    setCustomerSearch("");
    setShowCustomerResults(false);
    setTechnicianId("");
    setTitle("");
    setServiceDate("");
    setScheduledStart("");
    setScheduledEnd("");
    setStatus("scheduled");
    setNotes("");
    setIsRecurring(false);
    setRecurrenceWeeks(1);
    setErrors({
      customerId: "",
      title: "",
      serviceDate: "",
      scheduledStart: "",
      scheduledEnd: "",
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = validateForm({
      customerId,
      title,
      serviceDate,
      scheduledStart,
      scheduledEnd,
    });

    setErrors(newErrors);
    setErrorMessage("");
    setSuccessMessage("");

    if (
      newErrors.customerId ||
      newErrors.title ||
      newErrors.serviceDate ||
      newErrors.scheduledStart ||
      newErrors.scheduledEnd
    ) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          technician_id: technicianId || null,
          title: title.trim(),
          service_date: serviceDate || null,
          scheduled_start: scheduledStart || null,
          scheduled_end: scheduledEnd || null,
          status,
          notes: notes.trim() || null,
          is_recurring: isRecurring,
          recurrence_weeks:
            isRecurring && typeof recurrenceWeeks === "number"
              ? recurrenceWeeks
              : null,
          recurrence_type:
            isRecurring && typeof recurrenceWeeks === "string"
              ? recurrenceWeeks
              : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create job.");
        return;
      }

      setSuccessMessage("Job created successfully.");
      handleCancel();
      router.refresh();
    } catch {
      setErrorMessage("Unable to create job.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          New Job
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Schedule work for any customer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Customer">
          <div className="relative">
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                const value = e.target.value;
                setCustomerSearch(value);
                setCustomerId("");
                setShowCustomerResults(true);
                setErrors((prev) => ({
                  ...prev,
                  customerId: value.trim() ? "" : "Please select a customer.",
                }));
                setErrorMessage("");
                setSuccessMessage("");
              }}
              onFocus={() => setShowCustomerResults(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowCustomerResults(false);

                  if (selectedCustomer) {
                    setCustomerSearch(selectedCustomer.name);
                  }
                }, 150);
              }}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                errors.customerId
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
              }`}
              placeholder="Search customers..."
              autoComplete="off"
            />

            {showCustomerResults ? (
              <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onMouseDown={() =>
                        handleCustomerSelect(customer.id, customer.name)
                      }
                      className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition last:border-b-0 hover:bg-slate-50"
                    >
                      {customer.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    No customers found.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {errors.customerId ? (
            <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
          ) : null}
        </Field>

        <Field label="Technician">
          <select
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Unassigned</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
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
                ...validateForm({
                  customerId,
                  title: value,
                  serviceDate,
                  scheduledStart,
                  scheduledEnd,
                }),
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Service Date">
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => {
                const value = e.target.value;
                setServiceDate(value);
                setErrors((prev) => ({
                  ...prev,
                  ...validateForm({
                    customerId,
                    title,
                    serviceDate: value,
                    scheduledStart,
                    scheduledEnd,
                  }),
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Scheduled Start">
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => {
                const value = e.target.value;
                setScheduledStart(value);
                setErrors((prev) => ({
                  ...prev,
                  ...validateForm({
                    customerId,
                    title,
                    serviceDate,
                    scheduledStart: value,
                    scheduledEnd,
                  }),
                }));
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                errors.scheduledStart
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
              }`}
            />
            {errors.scheduledStart ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.scheduledStart}
              </p>
            ) : null}
          </Field>

          <Field label="Scheduled End">
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => {
                const value = e.target.value;
                setScheduledEnd(value);
                setErrors((prev) => ({
                  ...prev,
                  ...validateForm({
                    customerId,
                    title,
                    serviceDate,
                    scheduledStart,
                    scheduledEnd: value,
                  }),
                }));
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                errors.scheduledEnd
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
              }`}
            />
            {errors.scheduledEnd ? (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledEnd}</p>
            ) : null}
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
            placeholder="Any notes for this job…"
          />
        </Field>

        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <div
                className={`h-5 w-9 rounded-full transition-colors ${
                  isRecurring ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  isRecurring ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-slate-700">
              Recurring job
            </span>
          </label>

          {isRecurring ? (
            <div className="flex flex-wrap items-center gap-2 pl-1">
              <span className="text-sm text-slate-600">Repeats every</span>
              <select
                value={String(recurrenceWeeks)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "weekly_6_months" ||
                    value === "biweekly_6_months"
                  ) {
                    setRecurrenceWeeks(value);
                  } else {
                    setRecurrenceWeeks(Number(value));
                  }
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="1">1 week</option>
                <option value="2">2 weeks</option>
                <option value="3">3 weeks</option>
                <option value="4">4 weeks</option>
                <option value="weekly_6_months">Weekly for 6 months</option>
                <option value="biweekly_6_months">
                  Bi-weekly for 6 months
                </option>
              </select>
              <span className="text-xs text-slate-400">
                — next job auto-created when this one is completed
              </span>
            </div>
          ) : null}
        </div>

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

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving || !isFormValid}
            className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create Job"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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