"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  status: string;
};

export function SignupRequestActions({ id, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    setError("");

    try {
      const res = await fetch(`/api/signup-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request.");
    } finally {
      setLoading(null);
    }
  }

  if (status === "approved" || status === "rejected") {
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-400">No actions available</div>
        {error ? <div className="text-xs text-red-600">{error}</div> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading === "approve" ? "Approving..." : "Approve"}
        </button>

        <button
          type="button"
          onClick={() => handleAction("reject")}
          disabled={loading !== null}
          className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>

      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}