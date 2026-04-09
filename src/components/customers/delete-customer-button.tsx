"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteCustomerButtonProps = {
  customerId: string;
  customerName: string | null;
};

export function DeleteCustomerButton({
  customerId,
  customerName,
}: DeleteCustomerButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customerName || "this customer"}?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to delete customer.");
        setDeleting(false);
        return;
      }

      router.push("/customers");
      router.refresh();
    } catch {
      setErrorMessage("Unable to delete customer.");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4">
      {errorMessage ? (
        <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {deleting ? "Deleting..." : "Delete Customer"}
      </button>
    </div>
  );
}