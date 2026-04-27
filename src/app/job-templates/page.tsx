"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "../../components/layout/app-shell";

// ── Types ─────────────────────────────────��──────────────────────────���───────

type LineItem = {
  description: string;
  unit_price: number;
  quantity: number;
};

type JobTemplate = {
  id: string;
  title: string;
  service_type: string | null;
  notes: string | null;
  estimated_duration_minutes: number | null;
  line_items: LineItem[];
  created_at: string;
};

const SERVICE_TYPES = [
  "Mowing",
  "Edging",
  "Trimming",
  "Fertilizing",
  "Aeration",
  "Seeding",
  "Mulching",
  "Cleanup",
  "Hedge Trimming",
  "Leaf Removal",
  "Other",
];

const EMPTY_FORM = {
  title: "",
  service_type: "",
  notes: "",
  estimated_duration_minutes: "",
  line_items: [{ description: "", unit_price: 0, quantity: 1 }] as LineItem[],
};

// ── Helpers ────────────────────────────────────────────────────────���──────────

function lineItemsTotal(items: LineItem[]) {
  return items.reduce((sum, li) => sum + li.unit_price * li.quantity, 0);
}

function fmtDuration(mins: number | null) {
  if (!mins) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Main page ───────────────────────────���───────────────────────────��─────────

export default function JobTemplatesPage() {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/job-templates");
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json();
    setTemplates(data.templates ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError("");
    setShowForm(true);
  }

  function openEdit(t: JobTemplate) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      service_type: t.service_type ?? "",
      notes: t.notes ?? "",
      estimated_duration_minutes: t.estimated_duration_minutes?.toString() ?? "",
      line_items: t.line_items.length > 0 ? t.line_items : [{ description: "", unit_price: 0, quantity: 1 }],
    });
    setSaveError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError("");
  }

  function updateLineItem(idx: number, field: keyof LineItem, value: string | number) {
    setForm((prev) => {
      const items = [...prev.line_items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, line_items: items };
    });
  }

  function addLineItem() {
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { description: "", unit_price: 0, quantity: 1 }],
    }));
  }

  function removeLineItem(idx: number) {
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave() {
    if (!form.title.trim()) { setSaveError("Template title is required."); return; }
    setSaving(true);
    setSaveError("");

    const payload = {
      title: form.title.trim(),
      service_type: form.service_type || null,
      notes: form.notes.trim() || null,
      estimated_duration_minutes: form.estimated_duration_minutes
        ? parseInt(form.estimated_duration_minutes, 10)
        : null,
      line_items: form.line_items.filter((li) => li.description.trim()),
    };

    const url = editingId ? `/api/job-templates/${editingId}` : "/api/job-templates";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      await load();
      closeForm();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/job-templates/${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  // ── Upsell wall for Basic ───────────���─────────────────────────────────────
  if (!loading && forbidden) {
    return (
      <AppShell title="Job Templates">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Job Templates</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Save reusable job templates with pre-filled line items, notes, and estimated durations. Available on Pro and Premier plans.
          </p>
          <a
            href="/settings?tab=billing"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Upgrade to Pro →
          </a>
        </div>
      </AppShell>
    );
  }

  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <AppShell title="Job Templates">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {templates.length === 0
                ? "No templates yet — create one to speed up job creation."
                : `${templates.length} template${templates.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Template
          </button>
        </div>

        {/* Template list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <span className="mb-2 text-4xl">📋</span>
            <p className="text-sm font-medium text-slate-700">No templates yet</p>
            <p className="mt-1 text-sm text-slate-400">Create your first template to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => {
              const total = lineItemsTotal(t.line_items);
              return (
                <div key={t.id} className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  {/* Service type badge */}
                  {t.service_type && (
                    <span className="mb-2 self-start rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {t.service_type}
                    </span>
                  )}

                  <h3 className="text-base font-semibold text-slate-900">{t.title}</h3>

                  {/* Meta row */}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {t.estimated_duration_minutes && (
                      <span>⏱ {fmtDuration(t.estimated_duration_minutes)}</span>
                    )}
                    {total > 0 && (
                      <span className="font-semibold text-slate-700">
                        ${total.toFixed(2)} default
                      </span>
                    )}
                  </div>

                  {/* Line items preview */}
                  {t.line_items.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {t.line_items.map((li, i) => (
                        <li key={i} className="flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate">{li.description}</span>
                          <span className="ml-2 shrink-0 font-medium">
                            {li.quantity > 1 ? `${li.quantity}× ` : ""}${li.unit_price.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {t.notes && (
                    <p className="mt-3 line-clamp-2 text-xs text-slate-500 italic">{t.notes}</p>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => openEdit(t)}
                      className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="flex-1 rounded-lg border border-red-100 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === t.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Slide-in form panel */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit Template" : "New Job Template"}
                </h2>
                <button onClick={closeForm} className="text-slate-400 transition hover:text-slate-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                {/* Title + Service type */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Template Name *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Weekly Mowing"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Service Type</label>
                    <select
                      value={form.service_type}
                      onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">Select type…</option>
                      {SERVICE_TYPES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div className="max-w-xs">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Estimated Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={form.estimated_duration_minutes}
                    onChange={(e) => setForm({ ...form, estimated_duration_minutes: e.target.value })}
                    placeholder="e.g. 60"
                    className={inputCls}
                  />
                  {form.estimated_duration_minutes && (
                    <p className="mt-1 text-xs text-slate-400">
                      = {fmtDuration(parseInt(form.estimated_duration_minutes, 10))}
                    </p>
                  )}
                </div>

                {/* Line items */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Line Items (for default invoice amount)</label>
                    <span className="text-xs font-semibold text-slate-600">
                      Total: ${lineItemsTotal(form.line_items).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {form.line_items.map((li, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_100px_56px_32px] gap-2 items-center">
                        <input
                          type="text"
                          value={li.description}
                          onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                          placeholder="Description"
                          className={inputCls}
                        />
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={li.unit_price || ""}
                            onChange={(e) => updateLineItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className={`${inputCls} pl-7`}
                          />
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={li.quantity}
                          onChange={(e) => updateLineItem(idx, "quantity", parseInt(e.target.value) || 1)}
                          className={inputCls}
                          title="Quantity"
                        />
                        <button
                          onClick={() => removeLineItem(idx)}
                          disabled={form.line_items.length === 1}
                          className="flex h-9 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addLineItem}
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 transition hover:text-emerald-700"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add line item
                  </button>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Default Notes / Instructions</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="e.g. Mow front and back, edge driveway, blow clippings."
                    className={inputCls}
                  />
                </div>

                {saveError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>
                )}
              </div>

              <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Create Template"}
                </button>
                <button
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
