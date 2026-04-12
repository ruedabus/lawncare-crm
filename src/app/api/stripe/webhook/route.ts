import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { verifyWebhookSignature } from "../../../../lib/stripe/api";
import { buildInvoiceEmailData } from "../../../../lib/email/invoice-email-data";
import { invoicePaidEmail } from "../../../../lib/email/templates";
import { sendEmail } from "../../../../lib/email/send";

// Must read raw body for signature verification — disable body parsing
export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  // Verify signature if webhook secret is set
  if (webhookSecret) {
    const valid = await verifyWebhookSignature(payload, signature, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle successful payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const invoiceId = (session.metadata as Record<string, string>)?.invoice_id;
    const paymentStatus = session.payment_status as string;

    if (!invoiceId || paymentStatus !== "paid") {
      return NextResponse.json({ received: true });
    }

    const supabase = createServiceClient();

    // Mark invoice as paid
    const { data: invoice, error } = await supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_session_id: session.id as string,
      })
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) {
      console.error("Webhook: failed to update invoice", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send paid confirmation email (fire-and-forget)
    if (invoice) {
      buildInvoiceEmailData(supabase, invoiceId)
        .then(async (emailData) => {
          if (!emailData?.customerEmail) return;
          const html = invoicePaidEmail(emailData);
          await sendEmail({
            to: emailData.customerEmail,
            subject: `Payment received — Invoice ${emailData.invoiceNumber}`,
            html,
            fromName: emailData.businessName,
            replyTo: emailData.businessEmail || undefined,
          });
        })
        .catch((err) => console.error("Webhook: email send failed", err));
    }
  }

  return NextResponse.json({ received: true });
}
