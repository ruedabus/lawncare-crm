import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { CreateCustomerForm } from "../../components/customers/create-customer-form";
import { CustomersList } from "../../components/customers/customers-list";
import { ImportCustomersButton } from "../../components/customers/import-customers-button";

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Customers">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {(customers ?? []).length} customer{(customers ?? []).length !== 1 ? "s" : ""}
        </p>
        <ImportCustomersButton />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateCustomerForm />
        <CustomersList customers={customers ?? []} />
      </div>
    </AppShell>
  );
}