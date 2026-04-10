"use client";

import { useState } from "react";

type Customer = { id: string; name: string | null };
type Job = { id: string; title: string; customer_id: string };

type Props = {
  customers: Customer[];
  jobs: Job[];
};

export function CreateInvoiceFormGlobal({ customers, jobs }: Props) {
  const [customerId, setCustomerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const customerJobs = jobs.filter((j) => j.customer_id === customerId);

  function handleCustomerChange(id: string) {
    setCustomerId(id);
    setJobId("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          job_id: jobId || null,
          title,
          amount,
          due_date: dueDate || null,
          notes,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || "Failed to create invoice.");
        setSaving(false);
        return;
      }

      setSuccessMessage("Invoice created successfully.");
      setCustomerId("");
      setJobId("");
      setTitle("");
      setAmount("");
      setDueDate("");
      setNotes("");
      window.location.reload();
    } catch {
      setErrorMessage("Unable to create invoice.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">New Invoice</h2>
        <p className="mt-1 text-sm text-slate-500">
          Bill any customer for completed work.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Customer">
          <select
            required
            value={customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "Unnamed"}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Invoice Title">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="Lawn mowing — April"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount ($)">
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              placeholder="75.00"
            />
          </Field>

          <Field label="Due Date">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </Field>
        </div>

        {customerId && (
          <Field label="Related Job (optional)">
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">No related job</option>
              {customerJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="Any invoice notes…"
          />
        </Field>

        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Create Invoice"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
