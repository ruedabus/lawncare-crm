"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

type Invoice = {
  id: string;
  title: string;
  amount: number;
  status: string;
  created_at: string;
  due_date: string | null;
};

type Job = {
  id: string;
  title: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  notes: string | null;
};

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type Business = {
  name: string;
  email: string;
  phone: string;
  website: string;
};

type PortalData = {
  customer: Customer;
  invoices: Invoice[];
  jobs: Job[];
  business: Business;
  tips_enabled: boolean;
};

type Tab = "invoices" | "history" | "contact" | "request";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return `$${Number(amount).toFixed(2)}`;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-700",
    sent: "bg-blue-100 text-blue-700",
    draft: "bg-slate-100 text-slate-600",
    overdue: "bg-red-100 text-red-700",
    completed: "bg-emerald-100 text-emerald-700",
    scheduled: "bg-blue-100 text-blue-700",
    "in-progress": "bg-yellow-100 text-yellow-700",
    cancelled: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CustomerPortalPage() {
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("invoices");

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then((r) => {
        if (r.status === 401) { setExpired(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => { if (d) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (expired || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">This link has expired</h2>
        <p className="mt-2 text-slate-500">Portal links expire after 7 days. Please contact your service provider for a new link.</p>
        <p className="mt-6 text-sm text-slate-400">Powered by <span className="font-semibold text-emerald-600">YardPilot</span></p>
      </div>
    );
  }

  const { customer, invoices, jobs, business, tips_enabled } = data;
  const outstanding = invoices.filter((i) => i.status !== "paid");
  const paid = invoices.filter((i) => i.status === "paid");

  const tabs: { id: Tab; label: string }[] = [
    { id: "invoices", label: `Invoices${outstanding.length ? ` (${outstanding.length})` : ""}` },
    { id: "history", label: "Service History" },
    { id: "contact", label: "My Info" },
    { id: "request", label: "Request Service" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
              <p className="text-sm text-slate-500">Customer Portal</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">{customer.name}</p>
              {customer.email && <p className="text-xs text-slate-400">{customer.email}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {activeTab === "invoices" && (
          <InvoicesTab invoices={invoices} outstanding={outstanding} paid={paid} token={token} tipsEnabled={tips_enabled} />
        )}
        {activeTab === "history" && <HistoryTab jobs={jobs} />}
        {activeTab === "contact" && <ContactTab customer={customer} token={token} />}
        {activeTab === "request" && <RequestTab token={token} />}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-slate-400">
          Powered by{" "}
          <a href="https://www.yardpilot.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 hover:underline">
            YardPilot
          </a>
        </p>
      </footer>
    </div>
  );
}

// ── Tip Selector ──────────────────────────────────────────────────────────────

const TIP_PRESETS = [
  { label: "10%", pct: 0.10 },
  { label: "15%", pct: 0.15 },
  { label: "20%", pct: 0.20 },
];

function TipSelector({
  invoiceAmount,
  onTipChange,
}: {
  invoiceAmount: number;
  onTipChange: (tipCents: number) => void;
}) {
  const [selectedPct, setSelectedPct] = useState<number | null>(null);
  const [customDollars, setCustomDollars] = useState("");

  function selectPreset(pct: number) {
    setSelectedPct(pct);
    setCustomDollars("");
    onTipChange(Math.round(invoiceAmount * pct * 100));
  }

  function handleCustom(val: string) {
    setSelectedPct(null);
    setCustomDollars(val);
    const dollars = parseFloat(val);
    onTipChange(isNaN(dollars) || dollars < 0 ? 0 : Math.round(dollars * 100));
  }

  function clearTip() {
    setSelectedPct(null);
    setCustomDollars("");
    onTipChange(0);
  }

  const activeTipDollars = selectedPct !== null
    ? invoiceAmount * selectedPct
    : parseFloat(customDollars) || 0;

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">Add a tip? 💚</p>
      <div className="flex flex-wrap gap-2">
        {TIP_PRESETS.map(({ label, pct }) => (
          <button
            key={label}
            type="button"
            onClick={() => selectPreset(pct)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              selectedPct === pct
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400"
            }`}
          >
            {label}
            <span className="ml-1 text-xs opacity-75">
              ({fmt(invoiceAmount * pct)})
            </span>
          </button>
        ))}
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Custom"
            value={customDollars}
            onChange={(e) => handleCustom(e.target.value)}
            className={`w-28 rounded-lg border py-2 pl-7 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:ring-2 focus:ring-emerald-100 ${
              customDollars && selectedPct === null
                ? "border-emerald-600 bg-white"
                : "border-slate-300 bg-white"
            }`}
          />
        </div>
        {activeTipDollars > 0 && (
          <button
            type="button"
            onClick={clearTip}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400 transition hover:text-slate-600"
          >
            No tip
          </button>
        )}
      </div>
      {activeTipDollars > 0 && (
        <p className="mt-2 text-xs text-emerald-700">
          Tip: {fmt(activeTipDollars)} · Total charged: {fmt(invoiceAmount + activeTipDollars)}
        </p>
      )}
    </div>
  );
}

// ── Invoices Tab ──────────────────────────────────────────────────────────────

function InvoicesTab({ invoices, outstanding, paid, token, tipsEnabled }: {
  invoices: Invoice[];
  outstanding: Invoice[];
  paid: Invoice[];
  token: string;
  tipsEnabled: boolean;
}) {
  const [paying, setPaying] = useState<string | null>(null);
  const [payError, setPayError] = useState("");
  // Track tip amounts per invoice (in cents)
  const [tipCents, setTipCents] = useState<Record<string, number>>({});

  async function handlePay(invoiceId: string) {
    setPaying(invoiceId);
    setPayError("");
    try {
      const res = await fetch(`/api/portal/${token}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          tipAmountCents: tipCents[invoiceId] ?? 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed.");
      setPaying(null);
    }
  }

  if (invoices.length === 0) {
    return <EmptyState icon="📄" message="No invoices yet." />;
  }

  return (
    <div className="space-y-6">
      {outstanding.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Outstanding</h2>
          <div className="space-y-4">
            {outstanding.map((inv) => (
              <div key={inv.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{inv.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {fmtDate(inv.created_at)}
                      {inv.due_date && ` · Due ${fmtDate(inv.due_date)}`}
                    </p>
                    <div className="mt-1"><StatusBadge status={inv.status} /></div>
                  </div>
                  <p className="text-lg font-bold text-slate-900 shrink-0">{fmt(inv.amount)}</p>
                </div>

                {tipsEnabled && (
                  <TipSelector
                    invoiceAmount={Number(inv.amount)}
                    onTipChange={(cents) =>
                      setTipCents((prev) => ({ ...prev, [inv.id]: cents }))
                    }
                  />
                )}

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handlePay(inv.id)}
                    disabled={paying === inv.id}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {paying === inv.id
                      ? "Redirecting to payment…"
                      : `Pay ${fmt(Number(inv.amount) + (tipCents[inv.id] ?? 0) / 100)}`}
                  </button>
                  {payError && paying !== inv.id && (
                    <p className="text-center text-xs text-red-500">{payError}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {paid.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Paid</h2>
          <div className="space-y-3">
            {paid.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm opacity-75">
                <div>
                  <p className="font-medium text-slate-900">{inv.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{fmtDate(inv.created_at)}</p>
                  <div className="mt-1"><StatusBadge status="paid" /></div>
                </div>
                <p className="text-lg font-bold text-slate-900">{fmt(inv.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Service History Tab ───────────────────────────────────────────────────────

function HistoryTab({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) return <EmptyState icon="🌿" message="No service history yet." />;

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{job.title}</p>
              {job.scheduled_date && (
                <p className="mt-0.5 text-sm text-slate-500">{fmtDate(job.scheduled_date)}</p>
              )}
              {job.notes && <p className="mt-1 text-sm text-slate-400">{job.notes}</p>}
            </div>
            <StatusBadge status={job.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Contact Tab ───────────────────────────────────────────────────────────────

function ContactTab({ customer, token }: { customer: Customer; token: string }) {
  const [form, setForm] = useState({
    name: customer.name ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch(`/api/portal/${token}/contact`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Your Contact Information</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Service address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && <p className="text-sm text-emerald-600">✓ Saved</p>}
        {status === "error" && <p className="text-sm text-red-500">Something went wrong. Try again.</p>}
      </div>
    </form>
  );
}

// ── Request Service Tab ───────────────────────────────────────────────────────

function RequestTab({ token }: { token: string }) {
  const [form, setForm] = useState({ service: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`/api/portal/${token}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setForm({ service: "", notes: "" });
    } catch {
      setStatus("error");
    }
  }

  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <div className="mb-3 text-4xl">✅</div>
        <h3 className="font-semibold text-emerald-800">Request sent!</h3>
        <p className="mt-1 text-sm text-emerald-600">Your service provider will be in touch soon.</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-sm font-medium text-emerald-700 underline">
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Request a Service</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">What service do you need? *</label>
            <input
              type="text"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              placeholder="e.g. Lawn mowing, Hedge trimming, Fertilization…"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Additional notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any specific instructions or details…"
              rows={3}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending" || !form.service}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Submit request"}
        </button>
        {status === "error" && <p className="text-sm text-red-500">Something went wrong. Try again.</p>}
      </div>
    </form>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <span className="mb-2 text-4xl">{icon}</span>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
