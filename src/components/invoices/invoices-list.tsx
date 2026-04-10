"use client";

import { useState } from "react";
import Link from "next/link";

type Invoice = {
  id: string;
  title: string;
  amount: number;
  status: string;
  due_date: string | null;
  customer_id: string;
  customer_name: string | null;
};

type InvoicesListProps = {
  invoices: Invoice[];
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "Unpaid" },
  { key: "paid", label: "Paid" },
];

export function InvoicesList({ invoices: initial }: InvoicesListProps) {
  const [invoices, setInvoices] = useState(initial);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [payingId, setPayingId] = useState<string | null>(null);

  const filtered =
    activeTab === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === activeTab);

  const counts = {
    all: invoices.length,
    unpaid: invoices.filter((i) => i.status === "unpaid").length,
    paid: invoices.filter((i) => i.status === "paid").length,
  };

  async function markPaid(id: string) {
    setLoadingId(id);
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    setLoadingId(null);
    if (res.ok) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv))
      );
    }
  }

  async function sendInvoice(id: string) {
    setSendingId(id);
    const res = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
    setSendingId(null);
    if (res.ok) {
      setSentIds((prev) => new Set([...prev, id]));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to send invoice.");
    }
  }

  async function payOnline(id: string) {
    setPayingId(id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: id }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Could not start payment.");
        setPayingId(null);
      }
    } catch {
      alert("Network error. Please try again.");
      setPayingId(null);
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice?")) return;
    setLoadingId(id);
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setLoadingId(null);
    if (res.ok) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-4">
        {STATUS_TABS.map((tab) => (
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
              {counts[tab.key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No invoices found.
          </div>
        ) : (
          filtered.map((inv) => (
            <div key={inv.id} className="px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {inv.title || "Invoice"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        inv.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {inv.status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                    {inv.customer_name ? (
                      <Link
                        href={`/customers/${inv.customer_id}`}
                        className="hover:text-slate-800 hover:underline"
                      >
                        {inv.customer_name}
                      </Link>
                    ) : null}
                    <span className="font-medium text-slate-700">
                      ${Number(inv.amount).toFixed(2)}
                    </span>
                    {inv.due_date ? (
                      <span>
                        Due{" "}
                        {new Date(inv.due_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {inv.status !== "paid" && (
                    <button
                      onClick={() => payOnline(inv.id)}
                      disabled={payingId === inv.id}
                      className="rounded-lg border border-emerald-300 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {payingId === inv.id ? "Redirecting…" : "💳 Pay Now"}
                    </button>
                  )}
                  {inv.status !== "paid" && (
                    <button
                      onClick={() => markPaid(inv.id)}
                      disabled={loadingId === inv.id}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => sendInvoice(inv.id)}
                    disabled={sendingId === inv.id}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                      sentIds.has(inv.id)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                    }`}
                  >
                    {sendingId === inv.id
                      ? "Sending…"
                      : sentIds.has(inv.id)
                      ? "✓ Sent"
                      : "Send"}
                  </button>
                  <Link
                    href={`/invoices/${inv.id}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100"
                  >
                    PDF
                  </Link>
                  <button
                    onClick={() => deleteInvoice(inv.id)}
                    disabled={loadingId === inv.id}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
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
