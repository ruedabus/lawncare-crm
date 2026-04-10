import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createCheckoutSession } from "../../../../lib/stripe/api";

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch invoice
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select("id, title, amount, status, customer_id")
      .eq("id", invoiceId)
      .single();

    if (invError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }

    // Fetch customer separately
    const { data: customer } = await supabase
      .from("customers")
      .select("name, email")
      .eq("id", invoice.customer_id)
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const amountCents = Math.round(Number(invoice.amount) * 100);

    const session = await createCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.title ?? `Invoice ${invoice.id.slice(0, 8)}`,
      amountCents,
      customerEmail: customer?.email ?? undefined,
      customerName: customer?.name ?? undefined,
      description: "Lawn care services — YardPilot",
      successUrl: `${appUrl}/invoices/${invoice.id}?paid=success`,
      cancelUrl: `${appUrl}/invoices/${invoice.id}`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
