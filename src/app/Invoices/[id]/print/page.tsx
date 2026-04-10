import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { PrintTrigger, PrintButton } from "../../../../components/print/print-trigger";

type Params = Promise<{ id: string }>;

export default async function InvoicePrintPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch invoice + customer in parallel
  const [{ data: invoice }, { data: settings }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, customers(id, name, email, phone, address)")
      .eq("id", id)
      .single(),
    supabase
      .from("settings")
      .select(
        "business_name, business_address, business_phone, business_email, business_website"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!invoice) notFound();

  const customer = invoice.customers as {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;

  const invoiceNumber = `INV-${invoice.id.slice(0, 8).toUpperCase()}`;
  const issueDate = new Date(invoice.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date + "T12:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isPaid = invoice.status === "paid";
  const amount = Number(invoice.amount ?? 0);

  type BizSettings = {
    business_name?: string | null;
    business_address?: string | null;
    business_phone?: string | null;
    business_email?: string | null;
    business_website?: string | null;
  };
  const biz: BizSettings = settings ?? {};

  return (
    <>
      {/* Auto-print trigger (client component) */}
      <PrintTrigger />

      <div className="min-h-screen bg-slate-100 print:bg-white">
        {/* Screen-only toolbar */}
        <div className="flex items-center justify-between bg-slate-800 px-6 py-3 print:hidden">
          <p className="text-sm text-slate-300">
            Invoice Preview — {invoiceNumber}
          </p>
          <div className="flex gap-3">
            <a
              href="/invoices"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
            >
              ← Back
            </a>
            <PrintButton />
          </div>
        </div>

        {/* Invoice page */}
        <div className="mx-auto max-w-3xl bg-white print:max-w-none print:shadow-none shadow-xl my-6 print:my-0 rounded-2xl print:rounded-none overflow-hidden">

          {/* Header band */}
          <div className="bg-slate-900 px-10 py-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {biz.business_name || "LawnCare CRM"}
                </h1>
                {biz.business_address && (
                  <p className="mt-1 text-sm text-slate-400 whitespace-pre-line">
                    {biz.business_address}
                  </p>
                )}
                {biz.business_phone && (
                  <p className="mt-0.5 text-sm text-slate-400">{biz.business_phone}</p>
                )}
                {biz.business_email && (
                  <p className="text-sm text-slate-400">{biz.business_email}</p>
                )}
                {biz.business_website && (
                  <p className="text-sm text-slate-400">{biz.business_website}</p>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Invoice
                </p>
                <p className="mt-1 text-2xl font-bold">{invoiceNumber}</p>
                {isPaid ? (
                  <span className="mt-2 inline-block rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                    PAID
                  </span>
                ) : (
                  <span className="mt-2 inline-block rounded-full bg-amber-400 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-900">
                    UNPAID
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50 px-10 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Issue Date
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{issueDate}</p>
            </div>
            <div className="px-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Due Date
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {dueDate ?? "Upon receipt"}
              </p>
            </div>
            <div className="pl-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Amount Due
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                ${amount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Bill to */}
          <div className="px-10 py-7 border-b border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bill To
            </p>
            {customer ? (
              <div className="mt-2 space-y-0.5">
                <p className="text-base font-semibold text-slate-900">
                  {customer.name}
                </p>
                {customer.address && (
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {customer.address}
                  </p>
                )}
                {customer.phone && (
                  <p className="text-sm text-slate-600">{customer.phone}</p>
                )}
                {customer.email && (
                  <p className="text-sm text-slate-600">{customer.email}</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">—</p>
            )}
          </div>

          {/* Line items table */}
          <div className="px-10 py-7">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {invoice.title}
                    </p>
                    {invoice.notes && (
                      <p className="mt-1 text-sm text-slate-500 whitespace-pre-line">
                        {invoice.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-slate-900">
                    ${amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 ml-auto w-64 space-y-2 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              {isPaid && (
                <div className="flex justify-between text-sm font-semibold text-emerald-600">
                  <span>Amount Paid</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
              )}
              {!isPaid && (
                <div className="flex justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                  <span>Balance Due</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {(biz.business_name || biz.business_email) && (
            <div className="border-t border-slate-100 bg-slate-50 px-10 py-5 text-center print:bg-white">
              <p className="text-xs text-slate-400">
                Thank you for your business!
                {biz.business_name && ` — ${biz.business_name}`}
                {biz.business_email && ` · ${biz.business_email}`}
                {biz.business_phone && ` · ${biz.business_phone}`}
              </p>
            </div>
          )}
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
