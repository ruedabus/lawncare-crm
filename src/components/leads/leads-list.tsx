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

export function LeadsList({ leads: initial }: LeadsListProps) {
  const [leads, setLeads] = useState(initial);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
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

    // If converting to customer, create a customer record first
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
        if (!res.ok) {
          setLoadingId(null);
          return;
        }
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
      if (next === "converted") {
        router.push("/customers");
      }
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
    }
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
            <div key={lead.id} className="px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {lead.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[lead.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                    {lead.source ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        via {lead.source}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                    {lead.email ? <span>{lead.email}</span> : null}
                    {lead.phone ? <span>{lead.phone}</span> : null}
                    {lead.address ? <span>{lead.address}</span> : null}
                  </div>

                  {lead.notes ? (
                    <p className="mt-1 text-xs text-slate-400">{lead.notes}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {/* Advance status button */}
                  {NEXT_STATUS[lead.status] && (
                    <button
                      onClick={() => advanceStatus(lead)}
                      disabled={loadingId === lead.id}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                        lead.status === "qualified"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      {loadingId === lead.id
                        ? "Saving…"
                        : NEXT_STATUS_LABEL[lead.status]}
                    </button>
                  )}

                  {/* Mark lost (only for active leads) */}
                  {lead.status !== "lost" && lead.status !== "converted" && (
                    <button
                      onClick={() => markLost(lead.id)}
                      disabled={loadingId === lead.id}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                    >
                      Lost
                    </button>
                  )}

                  <button
                    onClick={() => deleteLead(lead.id)}
                    disabled={loadingId === lead.id}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
