"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Technician = {
  id: string;
  name: string;
  color: string;
};

type Customer = {
  id: string;
  name: string | null;
};

type ScheduleJob = {
  id: string;
  title: string;
  status: string;
  notes: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  technicianId: string | null;
  customerId: string;
  customerName: string;
};

type WeekScheduleProps = {
  technicians: Technician[];
  jobs: ScheduleJob[];
  customers: Customer[];
};

type CreateJobErrors = {
  customerId: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour;
  return `${display}:00 ${suffix}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateTimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function WeekSchedule({
  technicians,
  jobs,
  customers,
}: WeekScheduleProps) {
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createErrors, setCreateErrors] = useState<CreateJobErrors>({
    customerId: "",
    title: "",
    scheduledStart: "",
    scheduledEnd: "",
  });

  const [formState, setFormState] = useState({
    customerId: "",
    technicianId: "",
    title: "",
    notes: "",
    status: "scheduled",
    scheduledStart: "",
    scheduledEnd: "",
  });

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const upcoming = jobs.length;

  const scheduledToday = jobs.filter((job) => {
    if (!job.scheduledStart) return false;
    return sameDay(new Date(job.scheduledStart), new Date());
  }).length;

  const pastJobs = jobs.filter((job) => {
    if (!job.scheduledEnd) return false;
    return new Date(job.scheduledEnd) < new Date();
  }).length;

  function getTechnicianColor(technicianId: string | null) {
    return (
      technicians.find((tech) => tech.id === technicianId)?.color || "#94a3b8"
    );
  }

  function getTechnicianName(technicianId: string | null) {
    return technicians.find((tech) => tech.id === technicianId)?.name || "Unassigned";
  }

  function openCreateModal(technicianId: string, day: Date, hour: number) {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    setFormState({
      customerId: "",
      technicianId,
      title: "",
      notes: "",
      status: "scheduled",
      scheduledStart: toDateTimeLocal(start),
      scheduledEnd: toDateTimeLocal(end),
    });

    setCreateErrors({
      customerId: "",
      title: "",
      scheduledStart: "",
      scheduledEnd: "",
    });

    setErrorMessage("");
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    setErrorMessage("");
    setCreateErrors({
      customerId: "",
      title: "",
      scheduledStart: "",
      scheduledEnd: "",
    });
  }

  function validateCreateForm(values: {
    customerId: string;
    title: string;
    scheduledStart: string;
    scheduledEnd: string;
  }) {
    const errors: CreateJobErrors = {
      customerId: "",
      title: "",
      scheduledStart: "",
      scheduledEnd: "",
    };

    if (!values.customerId) {
      errors.customerId = "Please select a customer.";
    }

    if (!values.title.trim()) {
      errors.title = "Job title is required.";
    }

    if (!values.scheduledStart) {
      errors.scheduledStart = "Start time is required.";
    }

    if (!values.scheduledEnd) {
      errors.scheduledEnd = "End time is required.";
    }

    if (values.scheduledStart && values.scheduledEnd) {
      const start = new Date(values.scheduledStart);
      const end = new Date(values.scheduledEnd);

      if (Number.isNaN(start.getTime())) {
        errors.scheduledStart = "Invalid start time.";
      }

      if (Number.isNaN(end.getTime())) {
        errors.scheduledEnd = "Invalid end time.";
      }

      if (!errors.scheduledStart && !errors.scheduledEnd && end <= start) {
        errors.scheduledEnd = "End time must be after start time.";
      }
    }

    return errors;
  }

  async function handleCreateJob(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errors = validateCreateForm({
      customerId: formState.customerId,
      title: formState.title,
      scheduledStart: formState.scheduledStart,
      scheduledEnd: formState.scheduledEnd,
    });

    setCreateErrors(errors);
    setErrorMessage("");

    if (
      errors.customerId ||
      errors.title ||
      errors.scheduledStart ||
      errors.scheduledEnd
    ) {
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
          customer_id: formState.customerId,
          technician_id: formState.technicianId || null,
          title: formState.title.trim(),
          notes: formState.notes.trim() || null,
          status: formState.status,
          scheduled_start: new Date(formState.scheduledStart).toISOString(),
          scheduled_end: new Date(formState.scheduledEnd).toISOString(),
          service_date: formState.scheduledStart.split("T")[0],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create job.");
        return;
      }

      closeCreateModal();
      router.refresh();
    } catch {
      setErrorMessage("Unable to create job.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Upcoming Jobs" value={upcoming} color="bg-blue-600" />
          <StatCard
            label="Scheduled Today"
            value={scheduledToday}
            color="bg-emerald-600"
          />
          <StatCard label="Past Jobs" value={pastJobs} color="bg-slate-400" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Weekly Technician Schedule
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Click an empty slot to schedule a job for that technician.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              <div
                className="grid border-b border-slate-200 bg-slate-50"
                style={{
                  gridTemplateColumns: `120px repeat(${weekDays.length}, minmax(0, 1fr))`,
                }}
              >
                <div className="border-r border-slate-200 px-4 py-3 text-sm font-medium text-slate-500">
                  Time
                </div>

                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="border-r border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 last:border-r-0"
                  >
                    <div>
                      {day.toLocaleDateString(undefined, { weekday: "short" })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {day.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {technicians.map((tech) => (
                <div key={tech.id} className="border-b border-slate-200">
                  <div className="border-b border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900">
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tech.color }}
                    />
                    {tech.name}
                  </div>

                  {HOURS.map((hour) => (
                    <div
                      key={`${tech.id}-${hour}`}
                      className="grid"
                      style={{
                        gridTemplateColumns: `120px repeat(${weekDays.length}, minmax(0, 1fr))`,
                      }}
                    >
                      <div className="border-r border-t border-slate-100 px-4 py-4 text-xs text-slate-500">
                        {formatHour(hour)}
                      </div>

                      {weekDays.map((day) => {
                        const slotJobs = jobs.filter((job) => {
                          if (!job.scheduledStart) return false;
                          if (job.technicianId !== tech.id) return false;

                          const start = new Date(job.scheduledStart);
                          return sameDay(start, day) && start.getHours() === hour;
                        });

                        return (
                          <div
                            key={`${tech.id}-${day.toISOString()}-${hour}`}
                            className="min-h-[84px] border-r border-t border-slate-100 p-2 last:border-r-0"
                          >
                            {slotJobs.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => openCreateModal(tech.id, day, hour)}
                                className="flex h-full min-h-[68px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
                              >
                                + Add job
                              </button>
                            ) : (
                              <div className="space-y-2">
                                {slotJobs.map((job) => (
                                  <Link
                                    key={job.id}
                                    href={`/customers/${job.customerId}`}
                                    className="block rounded-xl border p-3 transition hover:opacity-95"
                                    style={{
                                      borderColor: `${getTechnicianColor(job.technicianId)}40`,
                                      backgroundColor: `${getTechnicianColor(job.technicianId)}15`,
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="truncate text-sm font-semibold text-slate-900">
                                        {job.title}
                                      </p>
                                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-700">
                                        {job.status}
                                      </span>
                                    </div>

                                    <p className="mt-1 text-xs font-medium text-slate-700">
                                      {job.customerName}
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-500">
                                      {getTechnicianName(job.technicianId)}
                                    </p>

                                    {job.notes ? (
                                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                        {job.notes}
                                      </p>
                                    ) : null}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Create Job
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add a new job directly from the calendar.
              </p>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Customer
                </label>
                <select
                  value={formState.customerId}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      customerId: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name || "Unnamed"}
                    </option>
                  ))}
                </select>
                {createErrors.customerId ? (
                  <p className="mt-1 text-sm text-red-600">
                    {createErrors.customerId}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Technician
                </label>
                <select
                  value={formState.technicianId}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      technicianId: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Unassigned</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  placeholder="Weekly Mowing"
                />
                {createErrors.title ? (
                  <p className="mt-1 text-sm text-red-600">
                    {createErrors.title}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Start
                  </label>
                  <input
                    type="datetime-local"
                    value={formState.scheduledStart}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        scheduledStart: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                  {createErrors.scheduledStart ? (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.scheduledStart}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    End
                  </label>
                  <input
                    type="datetime-local"
                    value={formState.scheduledEnd}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        scheduledEnd: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                  {createErrors.scheduledEnd ? (
                    <p className="mt-1 text-sm text-red-600">
                      {createErrors.scheduledEnd}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  value={formState.notes}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  placeholder="Add notes..."
                />
              </div>

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Create Job"}
                </button>

                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex">
        <div className={`w-2 shrink-0 ${color}`} />
        <div className="flex-1 p-5">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}