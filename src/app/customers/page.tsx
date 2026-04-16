import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { CreateCustomerForm } from "../../components/customers/create-customer-form";
import { CustomersList } from "../../components/customers/customers-list";

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

    <CustomersList customers={customers ?? []} /> 
    </div>	
    </AppShell>
  );
}