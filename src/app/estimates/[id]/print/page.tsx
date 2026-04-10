import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { PrintTrigger, PrintButton } from "../../../../components/print/print-trigger";

type LineItem = { description?: string; quantity?: number; unit_price?: number; amount?: number };
type Params = Promise<{ id: string }>;

export default async function EstimatePrintPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: estimate }, { data: settings }] = await Promise.all([
    supabase
      .from("estimates")
      .select("*, customers(id, name, email, phone, address)")
      .eq("id", id)
      .single(),
    supabase
      .from("settings")
      .select("business_name, business_address, business_phone, business_email, business_website")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!estimate) notFound();

  const customer = estimate.customers as { name: string; email: string | null; phone: string | null; address: string | null } | null;
  const biz = settings ?? {};
  const items: LineItem[] = Array.isArray(estimate.line_items) ? estimate.line_items : [];
  const total = Number(estimate.total ?? 0);
  const estimateNumber = `EST-${estimate.id.slice(0, 8).toUpperCase()}`;

  const issueDate = new Date(estimate.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const validUntil = estimate.valid_until
    ? new Date(estimate.valid_until + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const statusColors: Record<string, string> = {
    draft: "bg-slate-500",
    sent: "bg-sky-500",
    approved: "bg-emerald-500",
    declined: "bg-red-500",
    converted: "bg-violet-500",
  };
  const badgeColor = statusColors[estimate.status] ?? "bg-slate-500";

  return (
    <>
      <PrintTrigger />
      <div className="min-h-screen bg-slate-100 print:bg-white">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-slate-800 px-6 py-3 print:hidden">
          <p className="text-sm text-slate-300">Estimate Preview — {estimateNumber}</p>
          <div className="flex gap-3">
            <a href="/estimates" className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">← Back</a>
            <PrintButton />
          </div>
        </div>

        {/* Page */}
        <div className="mx-auto my-6 max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl print:my-0 print:max-w-none print:rounded-none print:shadow-none">

          {/* Header */}
          <div className="bg-slate-900 px-10 py-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{biz.business_name || "LawnCare CRM"}</h1>
                {biz.business_address && <p className="mt-1 text-sm text-slate-400 whitespace-pre-line">{biz.business_address}</p>}
                {biz.business_phone && <p className="text-sm text-slate-400">{biz.business_phone}</p>}
                {biz.business_email && <p className="text-sm text-slate-400">{biz.business_email}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Estimate</p>
                <p className="mt-1 text-2xl font-bold">{estimateNumber}</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-white ${badgeColor}`}>
                  {estimate.status}
                </span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50 px-10 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{issueDate}</p>
            </div>
            <div className="px-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Valid Until</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{validUntil ?? "—"}</p>
            </div>
            <div className="pl-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimate Total</p>
              <p className="mt-1 text-lg font-bold text-slate-900">${total.toFixed(2)}</p>
            </div>
          </div>

          {/* Bill to */}
          <div className="border-b border-slate-100 px-10 py-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prepared For</p>
            {customer ? (
              <div className="mt-2 space-y-0.5">
                <p className="text-base font-semibold text-slate-900">{customer.name}</p>
                {customer.address && <p className="text-sm text-slate-600 whitespace-pre-line">{customer.address}</p>}
                {customer.phone && <p className="text-sm text-slate-600">{customer.phone}</p>}
                {customer.email && <p className="text-sm text-slate-600">{customer.email}</p>}
              </div>
            ) : <p className="mt-2 text-sm text-slate-500">—</p>}
          </div>

          {/* Description */}
          {estimate.description && (
            <div className="border-b border-slate-100 px-10 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scope of Work</p>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{estimate.description}</p>
            </div>
          )}

          {/* Line items */}
          <div className="px-10 py-7">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Description</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Qty</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Unit Price</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 text-sm text-slate-800">{item.description || "—"}</td>
                    <td className="py-3 text-center text-sm text-slate-600">{item.quantity ?? 1}</td>
                    <td className="py-3 text-right text-sm text-slate-600">${Number(item.unit_price ?? 0).toFixed(2)}</td>
                    <td className="py-3 text-right text-sm font-medium text-slate-900">${Number(item.amount ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="ml-auto mt-6 w-64 space-y-2 border-t border-slate-200 pt-4">
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Estimate Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && (
            <div className="border-t border-slate-100 px-10 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</p>
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{estimate.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-10 py-5 text-center print:bg-white">
            <p className="text-xs text-slate-400">
              This is an estimate, not a final invoice.
              {biz.business_name && ` — ${biz.business_name}`}
              {biz.business_email && ` · ${biz.business_email}`}
              {biz.business_phone && ` · ${biz.business_phone}`}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; size: letter; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}
