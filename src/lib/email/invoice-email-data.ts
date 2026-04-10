import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceEmailData } from "./templates";

export type InvoiceEmailBundle = InvoiceEmailData & {
  /** The customer's actual email address — use this as the `to` field. */
  customerEmail: string;
};

/**
 * Fetches everything needed to build an invoice email from Supabase.
 * Returns null if the invoice or customer email is missing.
 */
export async function buildInvoiceEmailData(
  supabase: SupabaseClient,
  invoiceId: string,
  userId: string
): Promise<InvoiceEmailBundle | null> {
  const [{ data: invoice }, { data: settings }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, customers(id, name, email)")
      .eq("id", invoiceId)
      .single(),
    supabase
      .from("settings")
      .select("business_name, business_email, business_phone, business_website")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!invoice) return null;

  const customer = invoice.customers as {
    id: string;
    name: string;
    email: string | null;
  } | null;

  // We need a customer email to send to
  if (!customer?.email) return null;

  const biz = settings ?? {};
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return {
    customerEmail: customer.email,
    invoiceId: invoice.id,
    invoiceNumber: `INV-${invoice.id.slice(0, 8).toUpperCase()}`,
    invoiceTitle: invoice.title,
    amount: Number(invoice.amount ?? 0),
    dueDate: invoice.due_date
      ? new Date(invoice.due_date + "T12:00:00").toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null,
    customerName: customer.name,
    businessName: biz.business_name || "LawnCare CRM",
    businessEmail: biz.business_email || "",
    businessPhone: biz.business_phone ?? undefined,
    businessWebsite: biz.business_website ?? undefined,
    appUrl,
  };
}
