import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { AppShell } from "../../../components/layout/app-shell";
import { EditCustomerForm } from "../../../components/customers/edit-customer-form";
import { DeleteCustomerButton } from "../../../components/customers/delete-customer-button";
import { CreateJobForm } from "../../../components/jobs/create-job-form";
import { JobActions } from "../../../components/jobs/job-actions";
import { CreateInvoiceForm } from "../../../components/invoices/create-invoice-form";
import { InvoiceActions } from "../../../components/invoices/invoice-actions";

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

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Customer Details">
      <div className="space-y-6">
        <div>
          <Link href="/customers" className="text-sm text-slate-600 underline">
            ← Back to Customers
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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

            <DeleteCustomerButton
              customerId={customer.id}
              customerName={customer.name}
            />
          </div>

          <EditCustomerForm customer={customer} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CreateJobForm customerId={customer.id} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Customer Jobs
            </h3>

            {jobsError ? (
              <p className="mt-3 text-sm text-red-600">
                Error loading jobs: {jobsError.message}
              </p>
            ) : null}

            {!jobs?.length ? (
              <p className="mt-3 text-sm text-slate-500">
                No jobs yet for this customer.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">
                      Status: {job.status}
                    </p>
                    <p className="text-sm text-slate-500">
                      Service Date: {job.service_date || "Not set"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {job.notes || "No notes"}
                    </p>

                    <JobActions job={job} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CreateInvoiceForm customerId={customer.id} jobs={jobs || []} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Customer Invoices
            </h3>

            {invoicesError ? (
              <p className="mt-3 text-sm text-red-600">
                Error loading invoices: {invoicesError.message}
              </p>
            ) : null}

            {!invoices?.length ? (
              <p className="mt-3 text-sm text-slate-500">
                No invoices yet for this customer.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <p className="font-medium text-slate-900">{invoice.title}</p>
                    <p className="text-sm text-slate-500">
                      Amount: ${Number(invoice.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Status: {invoice.status}
                    </p>
                    <p className="text-sm text-slate-500">
                      Due Date: {invoice.due_date || "Not set"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {invoice.notes || "No notes"}
                    </p>

                    <InvoiceActions invoice={invoice} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}