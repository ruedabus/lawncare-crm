"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  source: string | null;
  status: string;
  notes: string | null;
};

type LeadsListProps = {
  leads: Lead[];
};

const TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "converted", label: "Converted" },
  { key: "lost", label: "Lost" },
];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  qualified: "bg-amber-100 text-amber-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

const NEXT_STATUS: Record<string, string> = {
  new: "contacted",
  contacted: "qualified",
  qualified: "converted",
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  new: "Mark Contacted",
  contacted: "Mark Qualified",
  qualified: "Convert →",
};

const ALL_STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

export function LeadsList({ leads: initial }: LeadsListProps) {
  const [leads, setLeads] = useState(initial);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  const filtered =
    activeTab === "all" ? leads : leads.filter((l) => l.status === activeTab);

  const counts = TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.key] =
      tab.key === "all"
        ? leads.length
        : leads.filter((l) => l.status === tab.key).length;
    return acc;
  }, {});

  async function advanceStatus(lead: Lead) {
    const next = NEXT_STATUS[lead.status];
    if (!next) return;

    setLoadingId(lead.id);

    if (next === "converted") {
      try {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            address: lead.address,
          }),
        });
        if (!res.ok) { setLoadingId(null); return; }
      } catch {
        setLoadingId(null);
        return;
      }
    }

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    setLoadingId(null);

    if (res.ok) {
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: next } : l))
      );
      if (next === "converted") router.push("/customers");
    }
  }

  async function markLost(id: string) {
    if (!confirm("Mark this lead as lost?")) return;
    setLoadingId(id);
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "lost" }),
    });
    setLoadingId(null);
    if (res.ok) {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "lost" } : l))
      );
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    setLoadingId(id);
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLoadingId(null);
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function updateLeadLocal(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "-mb-px border border-b-white border-slate-200 bg-white text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No leads here.
          </div>
        ) : (
          filtered.map((lead) => (
            <div key={lead.id}>
              {/* Row — click anywhere to expand */}
              <div
                className="cursor-pointer px-6 py-4 transition hover:bg-slate-50"
                onClick={() => toggleExpand(lead.id)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {lead.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[lead.status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                      {lead.source && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          via {lead.source}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                      {lead.email && <span>{lead.email}</span>}
                      {lead.phone && <span>{lead.phone}</span>}
                      {lead.address && <span>{lead.address}</span>}
                    </div>

                    {lead.notes && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-1">{lead.notes}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {/* Advance status */}
                    {NEXT_STATUS[lead.status] && (
                      <button
                        onClick={(e) => { e.stopPropagation(); advanceStatus(lead); }}
                        disabled={loadingId === lead.id}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                          lead.status === "qualified"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        {loadingId === lead.id ? "Saving…" : NEXT_STATUS_LABEL[lead.status]}
                      </button>
                    )}

                    {lead.status !== "lost" && lead.status !== "converted" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markLost(lead.id); }}
                        disabled={loadingId === lead.id}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                      >
                        Lost
                      </button>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                      disabled={loadingId === lead.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      Delete
                    </button>

                    {/* Expand chevron */}
                    <span className="text-slate-400">
                      {expandedId === lead.id ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded edit panel */}
              {expandedId === lead.id && (
                <LeadEditPanel
                  lead={lead}
                  onSave={(updated) => { updateLeadLocal(updated); setExpandedId(null); }}
                  onClose={() => setExpandedId(null)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Inline Edit Panel ─────────────────────────────────────────────────────────

function LeadEditPanel({
  lead,
  onSave,
  onClose,
}: {
  lead: Lead;
  onSave: (updated: Lead) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: lead.name,
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    address: lead.address ?? "",
    source: lead.source ?? "",
    status: lead.status,
    notes: lead.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Save failed.");
      return;
    }

    const { lead: updated } = await res.json();
    onSave(updated);
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="Full name"
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputCls}
              placeholder="(352) 555-0100"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
              placeholder="jane@example.com"
            />
          </Field>
          <Field label="Address">
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={inputCls}
              placeholder="123 Main St"
            />
          </Field>
          <Field label="Source">
            <input
              type="text"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className={inputCls}
              placeholder="QR Code, Referral, etc."
            />
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className={inputCls}
            placeholder="Add notes about this lead — property size, services discussed, follow-up reminders…"
          />
        </Field>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100";
