"use client";

import { useEffect, useState } from "react";

export default function PaidSuccessBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-lg">
        ✓
      </div>
      <div>
        <p className="font-semibold text-emerald-800">Payment received!</p>
        <p className="text-sm text-emerald-600">
          This invoice has been marked as paid. A confirmation email has been sent to the customer.
        </p>
      </div>
    </div>
  );
}
