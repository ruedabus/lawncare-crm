import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { InvoicesList } from "../../components/invoices/invoices-list";
import { CreateInvoiceFormGlobal } from "../../components/invoices/create-invoice-form-global";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: invoices }, { data: customers }, { data: jobs }] =
    await Promise.all([
      supabase
        .from("invoices")
        .select("*, customers(id, name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("customers")
        .select("id, name")
        .order("name", { ascending: true }),
      supabase
        .from("jobs")
        .select("id, title, customer_id")
        .order("title", { ascending: true }),
    ]);

  const invoiceList = (invoices ?? []).map((inv) => ({
    id: inv.id,
    title: inv.title,
    amount: inv.amount,
    status: inv.status,
    due_date: inv.due_date,
    customer_id: inv.customer_id,
    customer_name:
      (inv.customers as { name: string | null } | null)?.name ?? null,
  }));

  const customerList = (customers ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const jobList = (jobs ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    customer_id: j.customer_id,
  }));

  const total = invoiceList.length;
  const unpaid = invoiceList.filter((i) => i.status === "unpaid").length;
  const paid = invoiceList.filter((i) => i.status === "paid").length;
  const revenue = invoiceList
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <AppShell title="Invoices">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Invoices" value={total} color="bg-slate-700" />
          <StatCard label="Unpaid" value={unpaid} color="bg-amber-500" />
          <StatCard label="Paid" value={paid} color="bg-emerald-600" />
          <StatCard
            label="Revenue Collected"
            value={`$${revenue.toFixed(2)}`}
            color="bg-blue-600"
          />
        </div>

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <InvoicesList invoices={invoiceList} />
          </div>
          <div>
            <CreateInvoiceFormGlobal
              customers={customerList}
              jobs={jobList}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex">
        <div className={`w-2 shrink-0 ${color}`} />
        <div className="flex-1 p-5">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
