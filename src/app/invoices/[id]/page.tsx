import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { AppShell } from "../../../components/layout/app-shell";
import InvoiceActions from "../../../components/invoices/invoice-actions";
import PaidSuccessBanner from "./paid-success-banner";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function InvoicePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { paid } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, customers(id, name, email, phone, address)")
    .eq("id", id)
    .single();

  if (error || !invoice) notFound();

  type InvoiceWithCustomer = typeof invoice & {
    customers: {
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
    } | null;
  };

  const inv = invoice as InvoiceWithCustomer;
  const customer = inv.customers;

  const statusColors: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-700",
    unpaid: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
  };
  const statusColor = statusColors[inv.status] ?? statusColors.unpaid;

  return (
    <AppShell title="Invoice" backHref="/invoices">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Success banner shown after Stripe redirect */}
        {paid === "success" && <PaidSuccessBanner />}

        {/* Invoice card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{inv.title}</h2>
              {customer && (
                <p className="mt-1 text-sm text-slate-500">
                  Customer:{" "}
                  <a
                    href={`/customers/${customer.id}`}
                    className="font-medium text-slate-700 hover:underline"
                  >
                    {customer.name}
                  </a>
                </p>
              )}
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <Detail label="Amount" value={`$${Number(inv.amount).toFixed(2)}`} large />
            <Detail
              label="Due Date"
              value={inv.due_date
                ? new Date(inv.due_date + "T12:00:00").toLocaleDateString(undefined, {
                    month: "long", day: "numeric", year: "numeric",
                  })
                : "No due date"}
            />
            <Detail
              label="Created"
              value={new Date(inv.created_at).toLocaleDateString(undefined, {
                month: "long", day: "numeric", year: "numeric",
              })}
            />
            {inv.paid_at && (
              <Detail
                label="Paid On"
                value={new Date(inv.paid_at).toLocaleDateString(undefined, {
                  month: "long", day: "numeric", year: "numeric",
                })}
              />
            )}
            {inv.notes && (
              <div className="sm:col-span-2">
                <Detail label="Notes" value={inv.notes} />
              </div>
            )}
          </div>

          {/* Customer info */}
          {customer && (
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Customer Info
              </p>
              <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
                {customer.email && <span>📧 {customer.email}</span>}
                {customer.phone && <span>📞 {customer.phone}</span>}
                {customer.address && <span>📍 {customer.address}</span>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-slate-100 px-6 py-4">
            <InvoiceActions
              invoiceId={inv.id}
              customerId={customer?.id}
              canDelete
              canMarkPaid={inv.status !== "paid"}
              canPayOnline={inv.status !== "paid"}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Detail({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 ${large ? "text-2xl font-bold text-slate-900" : "text-sm text-slate-700"}`}>
        {value}
      </p>
    </div>
  );
}
