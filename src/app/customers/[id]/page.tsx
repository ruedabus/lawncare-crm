import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";
import { JobActions } from "../../../components/jobs/job-actions";
import { CreateJobForm } from "../../../components/jobs/create-job-form";
import { CreateInvoiceForm } from "../../../components/invoices/create-invoice-form";
import InvoiceActions from "../../../components/invoices/invoice-actions";
import { EditCustomerForm } from "../../../components/customers/edit-customer-form";

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
  
  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/login");
}

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) {
    notFound();
  }

  const [{ data: jobs }, { data: invoices }, { data: technicians }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),

      supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),

      supabase
  .from("technicians")
  .select("id, name, color, is_active")
  .eq("user_id", user.id)
  .eq("is_active", true)
  .order("name", { ascending: true }),
    ]);

  const jobList = jobs ?? [];
  const invoiceList = invoices ?? [];

  const jobOptions = jobList.map((job) => ({
    id: job.id,
    title: job.title,
  }));

  const technicianList = (technicians ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }));

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-neutral-500">Customer</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              {customer.name}
            </h1>

            <div className="mt-3 space-y-1 text-sm text-neutral-600">
              {customer.email ? <p>{customer.email}</p> : null}
              {customer.phone ? <p>{customer.phone}</p> : null}
              {customer.address ? <p>{customer.address}</p> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/customers"
              className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Back to Customers
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Jobs
              </h2>

              {jobList.length === 0 ? (
                <p className="text-sm text-neutral-500">No jobs yet.</p>
              ) : (
                <div className="space-y-4">
                  {jobList.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-neutral-200 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-neutral-900">
                            {job.title || "Untitled Job"}
                          </h3>

                          {job.notes ? (
                            <p className="mt-1 text-sm text-neutral-600">
                              {job.notes}
                            </p>
                          ) : null}

                          {job.service_date ? (
                            <p className="mt-1 text-xs text-neutral-500">
                              Service date:{" "}
                              {new Date(job.service_date).toLocaleDateString()}
                            </p>
                          ) : null}

                          {job.status ? (
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                              {job.status}
                            </p>
                          ) : null}
                        </div>

                        <JobActions job={job} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-neutral-100 pt-6">
                <CreateJobForm
                  customerId={customer.id}
                  customerName={customer.name}
                  serviceAddress={customer.address}
                  technicians={technicianList}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Invoices
              </h2>

              {invoiceList.length === 0 ? (
                <p className="text-sm text-neutral-500">No invoices yet.</p>
              ) : (
                <div className="space-y-4">
                  {invoiceList.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="rounded-xl border border-neutral-200 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-neutral-900">
                            {invoice.title || "Invoice"}
                          </h3>

                          <div className="mt-1 space-y-1 text-sm text-neutral-600">
                            {invoice.status ? (
                              <p>Status: {invoice.status}</p>
                            ) : null}

                            {invoice.amount != null ? (
                              <p>
                                Amount: $
                                {typeof invoice.amount === "number"
                                  ? invoice.amount.toFixed(2)
                                  : invoice.amount}
                              </p>
                            ) : null}

                            {invoice.due_date ? (
                              <p>
                                Due:{" "}
                                {new Date(invoice.due_date).toLocaleDateString()}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <InvoiceActions
                          invoiceId={invoice.id}
                          customerId={customer.id}
                          canEdit
                          canDelete
                          canMarkPaid={invoice.status !== "paid"}
                          canPayOnline={invoice.status !== "paid"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <EditCustomerForm
              customer={{
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
              }}
            />

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Create Invoice
              </h2>
              <CreateInvoiceForm customerId={customer.id} jobs={jobOptions} />
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Customer Summary
              </h2>

              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex items-center justify-between">
                  <span>Total Jobs</span>
                  <span className="font-medium text-neutral-900">
                    {jobList.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Total Invoices</span>
                  <span className="font-medium text-neutral-900">
                    {invoiceList.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Open Invoices</span>
                  <span className="font-medium text-neutral-900">
                    {
                      invoiceList.filter(
                        (invoice) => invoice.status !== "paid"
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}