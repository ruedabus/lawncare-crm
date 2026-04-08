import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { CreateCustomerForm } from "../../components/customers/create-customer-form";

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Customers">
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateCustomerForm />

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Customer List</h2>

          {error ? (
            <p className="text-sm text-red-600">
              Error loading customers: {error.message}
            </p>
          ) : null}

          {!customers?.length ? (
            <p className="text-sm text-slate-500">No customers yet.</p>
          ) : (
            <ul className="space-y-3">
              {customers.map((customer) => (
                <li
                  key={customer.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-medium text-slate-900 underline"
                  >
                    {customer.name}
                  </Link>

                  <p className="text-sm text-slate-500">
                    {customer.email || "No email"} •{" "}
                    {customer.phone || "No phone"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {customer.address || "No address"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}