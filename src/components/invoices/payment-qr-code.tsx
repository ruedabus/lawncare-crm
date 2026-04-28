"use client";

import { useState } from "react";
import Image from "next/image";

export function PaymentQrCode({ portalUrl }: { portalUrl: string }) {
  const [show, setShow] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(portalUrl)}&color=0f172a&bgcolor=ffffff&format=png&margin=10`;

  return (
    <div>
      <button
        onClick={() => setShow((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z" />
        </svg>
        {show ? "Hide QR Code" : "Show Payment QR"}
      </button>

      {show && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Customer scans to pay
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <Image
              src={qrUrl}
              alt="Payment QR code"
              width={200}
              height={200}
              unoptimized
            />
          </div>
          <p className="max-w-xs text-center text-xs text-slate-400">
            Opens the secure payment portal. Link is valid for 7 days.
          </p>
          <a
            href={qrUrl}
            download="payment-qr.png"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline"
          >
            Download QR image
          </a>
        </div>
      )}
    </div>
  );
}
