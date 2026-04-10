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
    if (!confirmed) return;

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

  const buttonBase =
   