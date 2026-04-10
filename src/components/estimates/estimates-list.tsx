"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LineItem = { description?: string; quantity?: number; unit_price?: number; amount?: number };

type Estimate = {
  id: string;
  title: string;
  total: number;
  status: string;
  valid_until: string | null;
  customer_id: string;
  customer_name: string | null;
  line_items: LineItem[];
  created_at: string;
};

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
  { key: "converted", label: "Converted" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-sky-100 text-sky-700",
  approved: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
  converted: "bg-violet-100 text-violet-700",
};

export function EstimatesList({ estimates: initial }: { estimates: Estimate[] }) {
  const router = useRouter();
  const [estimates, setEstimates] = useState(initial);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = activeTab === "all" ? estimates : estimates.filter((e) => e.status === activeTab);
  const counts = TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === "all" ? estimates.length : estimates.filter((e) => e.status === tab.key).length;
    return acc;
  }, {} as Record<string, number>);

  async function sendEstimate(id: string) {
    setLoadingId(id + "-send");
    const res = await fetch(`/api/estimates/${id}/send`, { method: "POST" });
    setLoadingId(null);
    if (res.ok) {
      setEstimates((prev) => prev.map((e) => e.id === id ? { ...e, status: "sent" } : e));
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Failed to send estimate.");
    }
  }

  async function updateStatus(id: string, status: string) {
    setLoadingId(id + "-status");
    const res = await fetch(`/api/estimates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoadingId(null);
    if (res.ok) {
      setEstimates((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    }
  }

  async function convertToJob(id: string) {
    if (!confirm("Convert this estimate to a job?")) return;
    setLoadingId(id + "-convert");
    const res = await fetch(`/api/estimates/${id}/convert`, { method: "POST" });
    setLoadingId(null);
    if (res.ok) {
      setEstimates((prev) => prev.map((e) => e.id === id ? { ...e, status: "converted" } : e));
      router.push("/jobs");
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Failed to convert estimate.");
    }
  }

  async function deleteEstimate(id: string) {
    if (!confirm("Delete this estimate?")) return;
    setLoadingId(id + "-delete");
    const res = await fetch(`/api/estimates/${id}`, { method: "DELETE" });
    setLoadingId(null);
    if (res.ok) setEstimates((prev) => prev.filter((e) => e.id !== id));
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
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${activeTab === tab.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">No estimates found.</div>
        ) : (
          filtered.map((est) => {
            const busy = (suffix: string) => loadingId === est.id + suffix;
            return (
              <div key={est.id} className="px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{est.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[est.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {est.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                      {est.customer_name && (
                        <Link href={`/customers/${est.customer_id}`} className="hover:text-slate-800 hover:underline">
                          {est.customer_name}
                        </Link>
                      )}
                      <span className="font-medium text-slate-700">${Number(est.total).toFixed(2)}</span>
                      {est.line_items?.length > 0 && (
                        <span>{est.line_items.length} line item{est.line_items.length !== 1 ? "s" : ""}</span>
                      )}
                      {est.valid_until && (
                        <span>Valid until {new Date(est.valid_until + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {/* PDF */}
                    <Link
                      href={`/estimates/${est.id}/print`}
                      target="_blank"
                      className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
                    >
                      PDF
                    </Link>

                    {/* Send */}
                    {est.status !== "converted" && (
                      <button
                        onClick={() => sendEstimate(est.id)}
                        disabled={!!loadingId}
                        className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                      >
                        {busy("-send") ? "Sending…" : est.status === "sent" ? "Resend" : "Send"}
                      </button>
                    )}

                    {/* Approve / Decline — only when sent */}
                    {est.status === "sent" && (
                      <>
                        <button
                          onClick={() => updateStatus(est.id, "approved")}
                          disabled={!!loadingId}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {busy("-status") ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => updateStatus(est.id, "declined")}
                          disabled={!!loadingId}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* Convert to Job — only when approved */}
                    {est.status === "approved" && (
                      <button
                        onClick={() => convertToJob(est.id)}
                        disabled={!!loadingId}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        {busy("-convert") ? "Converting…" : "→ Convert to Job"}
                      </button>
                    )}

                    {/* Delete — only draft or declined */}
                    {(est.status === "draft" || est.status === "declined") && (
                      <button
                        onClick={() => deleteEstimate(est.id)}
                        disabled={!!loadingId}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
