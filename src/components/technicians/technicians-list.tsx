"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Technician = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
};

type TechniciansListProps = {
  technicians: Technician[];
  errorMessage?: string;
};

type EditErrors = {
  name: string;
  email: string;
};

const COLOR_OPTIONS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#e11d48",
  "#64748b",
];

export function TechniciansList({
  technicians,
  errorMessage,
}: TechniciansListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    color: "#2563eb",
    is_active: true,
  });
  const [editErrors, setEditErrors] = useState<EditErrors>({
    name: "",
    email: "",
  });
  const [actionError, setActionError] = useState("");

  const filteredTechnicians = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return technicians;

    return technicians.filter((tech) => {
      const text = `${tech.name} ${tech.email ?? ""} ${tech.phone ?? ""}`.toLowerCase();
      return text.includes(term);
    });
  }, [technicians, search]);

  function validateForm(values: { name: string; email: string }): EditErrors {
    const errors: EditErrors = {
      name: "",
      email: "",
    };

    if (!values.name.trim()) {
      errors.name = "Technician name is required.";
    }

    if (
      values.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
    ) {
      errors.email = "Please enter a valid email address.";
    }

    return errors;
  }

  function startEdit(tech: Technician) {
    setEditingId(tech.id);
    setFormState({
      name: tech.name,
      email: tech.email ?? "",
      phone: tech.phone ?? "",
      color: tech.color ?? "#2563eb",
      is_active: tech.is_active,
    });
    setEditErrors({
      name: "",
      email: "",
    });
    setActionError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setActionError("");
    setEditErrors({
      name: "",
      email: "",
    });
  }

  async function saveEdit(id: string) {
    const errors = validateForm({
      name: formState.name,
      email: formState.email,
    });
    setEditErrors(errors);

    if (errors.name || errors.email) return;

    setSavingId(id);
    setActionError("");

    try {
      const response = await fetch(`/api/technicians/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim() || null,
          phone: formState.phone.trim() || null,
          color: formState.color,
          is_active: formState.is_active,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setActionError(result.error || "Failed to update technician.");
        return;
      }

      setEditingId(null);
      router.refresh();
    } catch {
      setActionError("Unable to update technician.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteTechnician(id: string, name: string) {
    const confirmed = window.confirm(
      `Delete technician "${name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setActionError("");

    try {
      const response = await fetch(`/api/technicians/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setActionError(result.error || "Failed to delete technician.");
        return;
      }

      router.refresh();
    } catch {
      setActionError("Unable to delete technician.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Technicians
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your crew, colors, and availability.
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technicians..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {actionError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-slate-500">
          {filteredTechnicians.length} result
          {filteredTechnicians.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {filteredTechnicians.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">
              No technicians found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first technician to start scheduling.
            </p>
          </div>
        ) : (
          filteredTechnicians.map((tech) => {
            const isEditing = editingId === tech.id;

            return (
              <div key={tech.id} className="px-6 py-5">
                {isEditing ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formState.name}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormState((prev) => ({ ...prev, name: value }));
                            setEditErrors((prev) => ({
                              ...prev,
                              ...validateForm({
                                name: value,
                                email: formState.email,
                              }),
                            }));
                          }}
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                            editErrors.name
                              ? "border-red-500 focus:ring-red-200"
                              : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                          }`}
                        />
                        {editErrors.name ? (
                          <p className="mt-1 text-sm text-red-600">
                            {editErrors.name}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formState.email}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormState((prev) => ({ ...prev, email: value }));
                            setEditErrors((prev) => ({
                              ...prev,
                              ...validateForm({
                                name: formState.name,
                                email: value,
                              }),
                            }));
                          }}
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                            editErrors.email
                              ? "border-red-500 focus:ring-red-200"
                              : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                          }`}
                        />
                        {editErrors.email ? (
                          <p className="mt-1 text-sm text-red-600">
                            {editErrors.email}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formState.phone}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Status
                        </label>
                        <select
                          value={formState.is_active ? "active" : "inactive"}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              is_active: e.target.value === "active",
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {COLOR_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setFormState((prev) => ({
                                ...prev,
                                color: option,
                              }))
                            }
                            className={`h-9 w-9 rounded-full border-2 transition ${
                              formState.color === option
                                ? "scale-110 border-slate-900"
                                : "border-white ring-1 ring-slate-200"
                            }`}
                            style={{ backgroundColor: option }}
                            aria-label={`Select color ${option}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => saveEdit(tech.id)}
                        disabled={savingId === tech.id}
                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {savingId === tech.id ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingId === tech.id}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: tech.color ?? "#2563eb" }}
                        />
                        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                          {tech.name}
                        </h3>

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            tech.is_active
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          {tech.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        {tech.email ? <span>{tech.email}</span> : <span>No email</span>}
                        {tech.phone ? <span>{tech.phone}</span> : <span>No phone</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(tech)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTechnician(tech.id, tech.name)}
                        disabled={deletingId === tech.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        {deletingId === tech.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}