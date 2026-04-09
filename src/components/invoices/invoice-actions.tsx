"use client";

import { useState } from "react";

type Invoice = {
  id: string;
  status: string;
};

type InvoiceActionsProps = {
  invoice: Invoice;
};

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function updateStatus(status: string) {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update invoice.");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setErrorMessage("Unable to update invoice.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteInvoice() {
    const confirmed = window.confirm("Delete this invoice?");

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to delete invoice.");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setErrorMessage("Unable to delete invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("unpaid")}
          className="rounded-lg border border-yellow-300 px-3 py-1 text-sm text-yellow-700 disabled:opacity-60"
        >
          Unpaid
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("paid")}
          className="rounded-lg border border-green-300 px-3 py-1 text-sm text-green-700 disabled:opacity-60"
        >
          Paid
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={deleteInvoice}
          className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700 disabled:opacity-60"
        >
          Delete Invoice
        </button>
      </div>
    </div>
  );
}