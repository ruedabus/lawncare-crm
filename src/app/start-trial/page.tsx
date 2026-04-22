"use client";

import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "$29.99",
    period: "/mo",
    description: "Perfect for solo operators getting organized.",
    features: [
      "Up to 50 customers",
      "Invoices & online payments",
      "Lead management",
      "Job scheduling",
      "QR lead capture",
      "Mobile-ready access",
      "Email support",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39.99",
    period: "/mo",
    description: "Best for growing lawn care businesses.",
    features: [
      "Up to 100 customers",
      "Everything in Basic",
      "Multiple technicians",
      "Lead source tracking",
      "Daily tech reminders",
      "Priority support",
    ],
    highlight: true,
  },
  {
    id: "premier",
    name: "Premier",
    price: "$59.99",
    period: "/mo",
    description: "For teams that want unlimited scale.",
    features: [
      "Unlimited customers",
      "Everything in Pro",
      "Advanced reporting",
      "Multiple QR codes",
      "Priority support",
    ],
    highlight: false,
  },
];

function Check() {
  return (
    <svg className="h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.07 7.07a1 1 0 01-1.414 0L3.296 8.85A1 1 0 114.71 7.436l4.217 4.217 6.363-6.363a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export default function StartTrialPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", businessName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Read coupon code from URL params (e.g. ?coupon=BETAUSER)
  const coupon = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("coupon") ?? undefined
    : undefined;

  async function handleStart() {
    if (!selectedPlan) { setError("Please select a plan."); return; }
    if (!form.name || !form.email) { setError("Please fill in your name and email."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          email: form.email,
          name: form.name,
          businessName: form.businessName,
          coupon,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            ← Back to home
          </Link>
        </div>

        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Start free trial</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
            14 days free. No charge until your trial ends.
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            Pick a plan, enter your details, and get instant access. Cancel anytime.
          </p>
        </div>

        {/* Plan selector */}
        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={[
                "relative rounded-2xl border-2 p-6 text-left transition",
                selectedPlan === plan.id
                  ? "border-emerald-500 bg-white shadow-md"
                  : "border-slate-200 bg-white hover:border-emerald-300",
              ].join(" ")}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              {selectedPlan === plan.id && (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">{plan.name}</p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="mb-0.5 text-sm text-slate-500">{plan.period}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
              <ul className="mt-4 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Details form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Your details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Business name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleStart}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Redirecting to Stripe..." : "Start 14-day free trial →"}
            </button>
            <p className="text-sm text-slate-500">
              You won&apos;t be charged until your trial ends. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
