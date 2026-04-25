"use client";

import { useState, useMemo } from "react";

export type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  notes: string | null;
};

const CATEGORIES = [
  "Fuel",
  "Equipment",
  "Parts & Blades",
  "Supplies",
  "Insurance",
  "Labor",
  "Vehicle",
  "Marketing",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Fuel":           "bg-orange-100 text-orange-700",
  "Equipment":      "bg-blue-100 text-blue-700",
  "Parts & Blades": "bg-purple-100 text-purple-700",
  "Supplies":       "bg-teal-100 text-teal-700",
  "Insurance":      "bg-slate-100 text-slate-700",
  "Labor":          "bg-emerald-100 text-emerald-700",
  "Vehicle":        "bg-amber-100 text-amber-700",
  "Marketing":      "bg-pink-100 text-pink-700",
  "Other":          "bg-gray-100 text-gray-700",
};

const emptyForm = () => ({
  date: new Date().toISOString().split("T")[0],
  category: "Fuel",
  description: "",
  amount: "",
  notes: "",
});

type Tab = "expenses" | "reports";

export function ExpensesClient({
  initialExpenses,
  planName,
  hasReports,
}: {
  initialExpenses: Expense[];
  planName: string;
  hasReports: boolean;
}) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [tab, setTab] = useState<Tab>("expenses");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("All");

  // ── Derived stats ────────────────────────────────────────────────────────
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totalAllTime = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalThisMonth = expenses
    .filter((e) => e.date.startsWith(thisMonth))
    .reduce((s, e) => s + Number(e.amount), 0);

  const filtered = filterCategory === "All"
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  // ── Form helpers ─────────────────────────────────────────────────────────
  function startAdd() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
    setShowForm(true);
  }

  function startEdit(exp: Expense) {
    setEditingId(exp.id);
    setForm({
      date: exp.date,
      category: exp.category,
      description: exp.description,
      amount: String(exp.amount),
      notes: exp.notes ?? "",
    });
    setFormError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
  }

  async function handleSave() {
    if (!form.description.trim() || !form.amount || Number(form.amount) <= 0) {
      setFormError("Description and a valid amount are required.");
      return;
    }
    setSaving(true);
    setFormError("");

    try {
      if (editingId) {
        const res = await fetch(`/api/expenses/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, amount: Number(form.amount) }),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error ?? "Save failed."); return; }
        setExpenses((prev) => prev.map((e) => e.id === editingId ? data.expense : e));
      } else {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, amount: Number(form.amount) }),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error ?? "Save failed."); return; }
        setExpenses((prev) => [data.expense, ...prev]);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="This Month" value={totalThisMonth} color="bg-rose-500" />
        <StatCard label="All Time" value={totalAllTime} color="bg-slate-700" />
        <StatCard label="Total Entries" value={expenses.length} color="bg-slate-500" money={false} />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 w-fit">
        <TabBtn active={tab === "expenses"} onClick={() => setTab("expenses")}>Expenses</TabBtn>
        <TabBtn active={tab === "reports"} onClick={() => setTab("reports")}>
          Reports {!hasReports && <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Premier</span>}
        </TabBtn>
      </div>

      {tab === "expenses" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="ml-auto">
              <button
                onClick={startAdd}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition"
              >
                + Add Expense
              </button>
            </div>
          </div>

          {/* Add / Edit form */}
          {showForm && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">{editingId ? "Edit Expense" : "New Expense"}</h3>
                <button onClick={cancelForm} className="text-sm text-slate-400 hover:text-slate-700">Cancel</button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={selectCls}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Description <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. New mower blades"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Amount ($) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any extra details…"
                  className={inputCls}
                />
              </div>

              {formError && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{formError}</p>}

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition"
                >
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Add Expense"}
                </button>
              </div>
            </div>
          )}

          {/* Expense list */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <p className="text-sm font-medium text-slate-500">No expenses yet</p>
              <p className="mt-1 text-xs text-slate-400">Click &quot;+ Add Expense&quot; to log your first one.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((exp) => (
                    <tr key={exp.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(exp.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[exp.category] ?? "bg-gray-100 text-gray-700"}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        <p className="font-medium">{exp.description}</p>
                        {exp.notes && <p className="text-xs text-slate-400 mt-0.5">{exp.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ${Number(exp.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(exp)}
                            className="text-xs text-slate-500 hover:text-slate-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            disabled={deletingId === exp.id}
                            className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === exp.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      {filterCategory !== "All" ? `${filterCategory} total` : "Total shown"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                      ${filtered.reduce((s, e) => s + Number(e.amount), 0).toFixed(2)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "reports" && (
        <ReportsTab expenses={expenses} hasReports={hasReports} planName={planName} />
      )}
    </div>
  );
}

// ── Reports tab ───────────────────────────────────────────────────────────────

function ReportsTab({ expenses, hasReports, planName }: { expenses: Expense[]; hasReports: boolean; planName: string }) {
  if (!hasReports) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-3">
        <div className="text-3xl">📊</div>
        <p className="text-base font-semibold text-amber-900">Expense Reports — Premier only</p>
        <p className="text-sm text-amber-800 max-w-md mx-auto">
          Upgrade to Premier to unlock monthly expense breakdowns, category totals, and a full P&amp;L view that shows your revenue vs. spend side by side.
        </p>
        <a
          href="/settings?tab=billing"
          className="inline-flex items-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
        >
          Upgrade to Premier →
        </a>
        <p className="text-xs text-amber-700">Currently on {planName} plan</p>
      </div>
    );
  }

  return <ExpenseReports expenses={expenses} />;
}

function ExpenseReports({ expenses }: { expenses: Expense[] }) {
  // Build monthly breakdown
  const monthlyData = useMemo(() => {
    const map: Record<string, { total: number; byCategory: Record<string, number> }> = {};
    for (const exp of expenses) {
      const month = exp.date.slice(0, 7); // "YYYY-MM"
      if (!map[month]) map[month] = { total: 0, byCategory: {} };
      map[month].total += Number(exp.amount);
      map[month].byCategory[exp.category] = (map[month].byCategory[exp.category] ?? 0) + Number(exp.amount);
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12);
  }, [expenses]);

  // Category totals all time
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of expenses) {
      map[exp.category] = (map[exp.category] ?? 0) + Number(exp.amount);
    }
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [expenses]);

  const grandTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);

  function formatMonth(m: string) {
    const [year, month] = m.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <p className="text-sm font-medium text-slate-500">No expense data yet</p>
        <p className="mt-1 text-xs text-slate-400">Add some expenses and they&apos;ll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">All-Time by Category</h3>
        <div className="space-y-3">
          {categoryTotals.map(([cat, total]) => {
            const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
            return (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-700"}`}>{cat}</span>
                  <span className="font-semibold text-slate-800">${total.toFixed(2)} <span className="text-xs font-normal text-slate-400">({pct.toFixed(0)}%)</span></span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-700 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-800">
          <span>Grand Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Monthly Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Top Category</th>
              <th className="px-4 py-3 text-right">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {monthlyData.map(([month, data]) => {
              const topCat = Object.entries(data.byCategory).sort(([, a], [, b]) => b - a)[0];
              return (
                <tr key={month} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{formatMonth(month)}</td>
                  <td className="px-4 py-3">
                    {topCat && (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[topCat[0]] ?? "bg-gray-100 text-gray-700"}`}>
                        {topCat[0]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">${data.total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Small reusables ───────────────────────────────────────────────────────────

function StatCard({ label, value, color, money = true }: { label: string; value: number; color: string; money?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex">
        <div className={`w-2 shrink-0 ${color}`} />
        <div className="flex-1 p-5">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {money ? `$${Number(value).toFixed(2)}` : value}
          </p>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";
const selectCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";
