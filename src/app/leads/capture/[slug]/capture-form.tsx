"use client";

import { useState } from "react";

interface Props {
  slug: string;
  businessName: string;
}

export function CaptureForm({ slug, businessName }: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-7 w-7 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Thanks!</h2>
        <p className="mt-2 text-sm text-slate-500">
          {businessName} will be reaching out to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Jane Smith"
          className={inputCls}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Phone Number
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="(352) 555-0100"
          className={inputCls}
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="jane@example.com"
          className={inputCls}
        />
      </div>

      {/* Service */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Service You&apos;re Interested In
        </label>
        <select
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          className={inputCls}
        >
          <option value="">Select a service…</option>
          <option value="Lawn Mowing">Lawn Mowing</option>
          <option value="Hedge Trimming">Hedge Trimming</option>
          <option value="Landscaping">Landscaping</option>
          <option value="Fertilization">Fertilization</option>
          <option value="Weed Control">Weed Control</option>
          <option value="Leaf Removal">Leaf Removal</option>
          <option value="Full Lawn Care Package">Full Lawn Care Package</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Anything else? (optional)
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Tell us about your property or any specific needs…"
          rows={3}
          className={inputCls}
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Request a Free Quote"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100";
