"use client";

import { useState, useEffect } from "react";

type Plan = {
  id: string;
  plan_name: string;
  amount_cents: number;
  interval: string;
  status: "pending" | "active" | "cancelled" | "past_due";
  next_billing_date: string | null;
  created_at: string;
};

type Props = {
  customerId: string;
  customerEmail: string | null;
};

function StatusPill({ status }: { status: Plan["status"] }) {
  const styles: Record<Plan["status"], string> = {
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    past_due: "bg-red-100 text-red-700",
    cancelled: "bg-neutral-100 text-neutral-500",
  };
  const labels: Record<Plan["status"], string> = {
    active: "Active",
    pending: "Awaiting payment setup",
    past_due: "Payment past due",
    cancelled: "Cancelled",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function RecurringPlanCard({ customerId, customerEmail }: Props) {
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined); // undefined = loading
  const [showForm, setShowForm] = useState(false);
  const [planName, setPlanName] = useState("Monthly Lawn Care");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`/api/customers/${customerId}/recurring-plan`)
      .then((r) => r.json())
      .then((d) => setPlan(d.plan))
      .catch(() => setPlan(null));
  }, [customerId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/customers/${customerId}/recurring-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, amountDollars: amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create plan.");
      } else {
        setPlan(data.plan);
        setShowForm(false);
        setSuccess(`Plan created! Payment setup link sent to ${customerEmail}.`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this recurring plan? Your customer will no longer be charged.")) return;
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/customers/${customerId}/recurring-plan`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to cancel plan.");
      } else {
        setPlan(null);
        setSuccess("Recurring plan cancelled.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  if (plan === undefined) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-neutral-900">Recurring Plan</h2>
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-neutral-900">Recurring Plan</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Charge your customer automatically every month — no manual invoicing needed.
      </p>

      {success && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <p className="text-sm text-emerald-800">{success}</p>
        </div>
      )}

      {error && (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      )}

      {plan ? (
        // Active / pending plan display
        <div className="space-y-3">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-neutral-900">{plan.plan_name}</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  ${(plan.amount_cents / 100).toFixed(2)}/month
                </p>
              </div>
              <StatusPill status={plan.status} />
            </div>
            {plan.next_billing_date && (
              <p className="mt-2 text-xs text-neutral-400">
                Next charge: {new Date(plan.next_billing_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>

          {plan.status === "pending" && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Waiting for {customerEmail} to complete payment setup. Resend the link by cancelling and re-creating the plan.
            </p>
          )}

          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Cancel Recurring Plan"}
          </button>
        </div>
      ) : showForm ? (
        // Create plan form
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Plan Name</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Monthly Lawn Care"
              required
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Monthly Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="150.00"
                required
                className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-7 pr-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            An email will be sent to {customerEmail} with a link to enter their card.
            They'll be charged <strong>${amount || "0.00"}/month</strong> automatically after that.
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Plan & Send Link"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // No plan — prompt to create
        <div className="space-y-3">
          {!customerEmail && (
            <p className="text-xs text-neutral-400 italic">
              Add an email address to this customer to set up recurring billing.
            </p>
          )}
          <button
            onClick={() => { setShowForm(true); setSuccess(""); setError(""); }}
            disabled={!customerEmail}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Set Up Recurring Plan
          </button>
        </div>
      )}
    </div>
  );
}
