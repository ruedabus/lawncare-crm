"use client";

import { useState } from "react";

type Props = {
  customerId: string;
  customerEmail: string | null;
};

export function SendPortalLinkButton({ customerId, customerEmail }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!customerEmail) {
    return (
      <p className="text-xs text-neutral-400 italic">
        Add an email address to send the portal link.
      </p>
    );
  }

  async function handleSend() {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/customers/${customerId}/send-portal`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to send portal link.");
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <p className="text-sm font-medium text-emerald-800">Portal link sent to {customerEmail}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSend}
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {status === "sending" ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Send Portal Link
          </>
        )}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
      <p className="text-xs text-neutral-400">
        Emails {customerEmail} a secure link — valid 7 days.
      </p>
    </div>
  );
}
