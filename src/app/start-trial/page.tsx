"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type FormState = {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  team_size: string;
  city: string;
  state: string;
  message: string;
};

const initialState: FormState = {
  full_name: "",
  company_name: "",
  email: "",
  phone: "",
  team_size: "",
  city: "",
  state: "",
  message: "",
};

export default function StartTrialPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/signup-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      setSuccess("Your request was submitted. We’ll review it and send your invite soon.");
      setForm(initialState);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit request.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            ← Back to home
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Start free trial
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
              Request access to YardPilot
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Tell us a little about your business and we’ll get your account set up.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Business name
                </label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => updateField("company_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Team size
                </label>
                <select
                  value={form.team_size}
                  onChange={(e) => updateField("team_size", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select one</option>
                  <option value="Just me">Just me</option>
                  <option value="2-5">2-5</option>
                  <option value="6-10">6-10</option>
                  <option value="10+">10+</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                What do you want help with most?
              </label>
              <textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-[0_20px_50px_rgba(16,185,129,0.28)] transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Request my free trial"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}