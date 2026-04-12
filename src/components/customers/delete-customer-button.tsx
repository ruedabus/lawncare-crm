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
    <div className="mt-6">
      {errorMessage ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {deleting ? "Deleting..." : "Delete Customer"}
      </button>
    </div>
  );
}