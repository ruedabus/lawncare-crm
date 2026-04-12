"use client";

import { useEffect } from "react";

export function PrintTrigger() {
  useEffect(() => {
    // Small delay so the page fully renders before the dialog opens
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);

  return null;
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
    >
      Print / Save as PDF
    </button>
  );
}
