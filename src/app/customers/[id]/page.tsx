import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { AppShell } from "../../../components/layout/app-shell";

type CustomerDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailsPage({
  params,
}: CustomerDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !customer) {
    notFound();
  }

  return (
    <AppShell title="Customer Details">
      <div className="space-y-6">
        <div>
          <Link href="/customers" className="text-sm text-slate-600 underline">
            ← Back to Customers
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-bold text-slate-900">
            {customer.name}
          </h2>

          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {customer.email || "No email"}
            </div>

            <div>
              <span className="font-semibold">Phone:</span>{" "}
              {customer.phone || "No phone"}
            </div>

            <div>
              <span className="font-semibold">Address:</span>{" "}
              {customer.address || "No address"}
            </div>

            <div>
              <span className="font-semibold">Created:</span>{" "}
              {customer.created_at
                ? new Date(customer.created_at).toLocaleString()
                : "Unknown"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Future Sections
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Jobs for this customer</li>
            <li>Invoices for this customer</li>
            <li>Notes and service history</li>
            <li>Communication log</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}