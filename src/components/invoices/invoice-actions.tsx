"use client";

import Link from "next/link";
import { useState } from "react";

type InvoiceActionsProps = {
  invoiceId: string;
  customerId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canMarkPaid?: boolean;
  canPayOnline?: boolean;
};

export default function InvoiceActions({
  invoiceId,
  customerId,
  canEdit = true,
  canDelete = false,
  canMarkPaid = false,
  canPayOnline = false,
}: InvoiceActionsProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [paid, setPaid] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const buttonBase =
    "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus:outline-none disabled:opacity-50";

  async function handleSend() {
    setSending(true);
    const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
    setSending(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to send invoice. Make sure the customer has an email address.");
    }
  }

  async function handlePayOnline() {
    setRedirecting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Could not start payment. Please try again.");
        setRedirecting(false);
      }
    } catch {
      alert("Network error. Please try again.");
      setRedirecting(false);
    }
  }

  async function handleMarkPaid() {
    setMarkingPaid(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    setMarkingPaid(false);
    if (res.ok) {
      setPaid(true);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* PDF — opens print page in new tab */}
      <Link
        href={`/invoices/${invoiceId}/print`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonBase} border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100`}
      >
        PDF
      </Link>

      {/* Send invoice email */}
      <button
        onClick={handleSend}
        disabled={sending}
        className={`${buttonBase} ${
          sent
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
        }`}
      >
        {sending ? "Sending…" : sent ? "✓ Sent" : "Send"}
      </button>

      {/* Pay Now via Stripe */}
      {canPayOnline && !paid && (
        <button
          onClick={handlePayOnline}
          disabled={redirecting}
          className={`${buttonBase} border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50`}
        >
          {redirecting ? "Redirecting…" : "💳 Pay Now"}
        </button>
      )}

      {/* Mark paid manually */}
      {(canMarkPaid && !paid) && (
        <button
          onClick={handleMarkPaid}
          disabled={markingPaid}
          className={`${buttonBase} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
        >
          {markingPaid ? "Saving…" : "Mark Paid"}
        </button>
      )}

      {paid && (
        <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          ✓ Paid
        </span>
      )}

      {/* Delete */}
      {canDelete && (
        <DeleteButton invoiceId={invoiceId} />
      )}
    </div>
  );
}

function DeleteButton({ invoiceId }: { invoiceId: string }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this invoice?")) return;
    setDeleting(true);
    await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    // Refresh the page to reflect deletion
    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
    >
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
