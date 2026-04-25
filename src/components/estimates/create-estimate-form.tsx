"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Customer = { id: string; name: string };
type LineItem = { description: string; quantity: number; unit_price: number; amount: number };

type LotSizeResult = {
  sqft: number;
  acres: number;
  tier: "small" | "medium" | "large";
  suggestedPrice: number;
};

const emptyItem = (): LineItem => ({ description: "", quantity: 1, unit_price: 0, amount: 0 });

const TIER_LABELS: Record<string, string> = {
  small: "Small lot",
  medium: "Medium lot",
  large: "Large lot",
};

const TIER_COLORS: Record<string, string> = {
  small: "bg-sky-50 text-sky-700 ring-sky-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  large: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function CreateEstimateForm({
  customers,
  planName,
}: {
  customers: Customer[];
  planName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  // Smart Estimate state
  const [sqftInput, setSqftInput] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [lotResult, setLotResult] = useState<LotSizeResult | null>(null);
  const [lotError, setLotError] = useState("");

  const hasSmartEstimate = planName === "pro" || planName === "premier";
  const total = items.reduce((s, i) => s + i.amount, 0);

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      if (field === "quantity" || field === "unit_price") {
        item.amount = Number(item.quantity) * Number(item.unit_price);
      }
      if (field === "amount") {
        item.amount = Number(value);
      }
      next[index] = item;
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function calculateLotSize() {
    const sqft = Number(sqftInput);
    if (!sqft || sqft <= 0) return;
    setCalculating(true);
    setLotResult(null);
    setLotError("");
    try {
      const res = await fetch(`/api/lot-size?sqft=${sqft}`);
      const data = await res.json();
      if (!res.ok) {
        setLotError(data.error ?? "Could not calculate lot size tier.");
      } else {
        setLotResult(data);
      }
    } catch {
      setLotError("Network error — please try again.");
    } finally {
      setCalculating(false);
    }
  }

  function applyLotPrice() {
    if (!lotResult) return;
    const desc = `Lawn service — ${TIER_LABELS[lotResult.tier]} (${lotResult.sqft.toLocaleString()} sq ft)`;
    const newItem: LineItem = {
      description: desc,
      quantity: 1,
      unit_price: lotResult.suggestedPrice,
      amount: lotResult.suggestedPrice,
    };
    setItems((prev) => {
      // If there's a single empty item, replace it; otherwise append
      if (prev.length === 1 && !prev[0].description && prev[0].unit_price === 0) {
        return [newItem];
      }
      return [...prev, newItem];
    });
    setLotResult(null);
    setSqftInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) { setError("Please select a customer."); return; }
    setError("");
    setSaving(true);
    const res = await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId, title, description, line_items: items, valid_until: validUntil, notes }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      setCustomerId(""); setTitle(""); setDescription(""); setValidUntil(""); setNotes("");
      setItems([emptyItem()]);
      setSqftInput(""); setLotResult(null); setLotError("");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to create estimate.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        + New Estimate
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">New Estimate</h2>
        <button onClick={() => setOpen(false)} className="text-sm text-slate-400 hover:text-slate-700">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Customer <span className="text-red-500">*</span></label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={selectCls} required>
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Spring lawn care package" className={inputCls} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional overview of the work…" className={inputCls} />
        </div>

        {/* Smart Estimate */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🏡</span>
            <span className="text-sm font-semibold text-slate-800">Smart Estimate</span>
            {hasSmartEstimate && (
              <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">Active</span>
            )}
          </div>

          {!hasSmartEstimate ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="font-semibold">Pro feature.</span> Enter an address to auto-detect lot size and suggest a price based on your tiers. Available on Pro and Premier plans.
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500">
                Enter the property&apos;s square footage to get a suggested price based on your configured tiers.
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={sqftInput}
                  onChange={(e) => { setSqftInput(e.target.value); setLotResult(null); setLotError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); calculateLotSize(); } }}
                  placeholder="e.g. 8500"
                  className={inputCls + " flex-1"}
                />
                <button
                  type="button"
                  onClick={calculateLotSize}
                  disabled={calculating || !sqftInput || Number(sqftInput) <= 0}
                  className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {calculating ? "Calculating…" : "Get Price"}
                </button>
              </div>

              {lotError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{lotError}</p>
              )}

              {lotResult && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{lotResult.sqft.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">sq ft</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{lotResult.acres}</p>
                      <p className="text-xs text-slate-500">acres</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${TIER_COLORS[lotResult.tier]}`}>
                      {TIER_LABELS[lotResult.tier]}
                    </span>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-slate-500">Suggested price</p>
                      <p className="text-xl font-bold text-emerald-700">${lotResult.suggestedPrice}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={applyLotPrice}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
                  >
                    + Add to Line Items at ${lotResult.suggestedPrice}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Line items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Line Items</label>
            <button type="button" onClick={addItem} className="text-xs font-medium text-slate-500 hover:text-slate-900">+ Add item</button>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit price</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1" />
            </div>

            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 border-t border-slate-100 px-3 py-2 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="e.g. Lawn mowing"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(i, "unit_price", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div className="col-span-2 text-right text-sm font-medium text-slate-800">
                  ${item.amount.toFixed(2)}
                </div>
                <div className="col-span-1 text-center">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-400 text-base leading-none">×</button>
                  )}
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="grid grid-cols-12 gap-2 border-t-2 border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="col-span-9 text-right text-sm font-semibold text-slate-700">Total</div>
              <div className="col-span-2 text-right text-sm font-bold text-slate-900">${total.toFixed(2)}</div>
              <div className="col-span-1" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Valid Until</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Internal Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="For your reference only" className={inputCls} />
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
            {saving ? "Saving…" : "Create Estimate"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";
const selectCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";
