"use client";

import { useState } from "react";
import { ImportCustomersModal } from "./import-customers-modal";

export function ImportCustomersButton() {
  const [open, setOpen] = useState(false);

  function handleImported() {
    // Refresh the page to show new customers
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Import CSV
      </button>

      {open && (
        <ImportCustomersModal
          onClose={() => setOpen(false)}
          onImported={handleImported}
        />
      )}
    </>
  );
}
