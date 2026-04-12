import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { sendEmail } from "../../../../../lib/email/send";
import { buildInvoiceEmailData } from "../../../../../lib/email/invoice-email-data";
import { invoiceCreatedEmail } from "../../../../../lib/email/templates";
import { createCheckoutSession } from "../../../../../lib/stripe/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emailData = await buildInvoiceEmailData(supabase, id, user.id);

    if (!emailData) {
      return NextResponse.json(
        {
          error:
            "Could not send — make sure the customer has an email address on file.",
        },
        { status: 422 }
      );
    }

    // Generate a Stripe checkout URL to embed directly in the email
    let payUrl: string | undefined;
    if (process.env.STRIPE_SECRET_KEY && emailData.amount > 0) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        const session = await createCheckoutSession({
          invoiceId: id,
          invoiceNumber: emailData.invoiceNumber,
          amountCents: Math.round(emailData.amount * 100),
          customerEmail: emailData.customerEmail,
          customerName: emailData.customerName,
          description: emailData.invoiceTitle,
          successUrl: `${appUrl}/payment-success?invoice=${id}`,
          cancelUrl: `${appUrl}/payment-cancelled`,
        });
        payUrl = session.url;
      } catch {
        // Non-fatal — email sends without Pay Now button if Stripe fails
      }
    }

    const result = await sendEmail({
      to: emailData.customerEmail,
      fromName: emailData.businessName,
      subject: `Invoice ${emailData.invoiceNumber} from ${emailData.businessName}`,
      html: invoiceCreatedEmail({ ...emailData, payUrl }),
      replyTo: emailData.businessEmail || undefined,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Email failed to send." },
        { status: 500 }
      );
    }

    // Log the send timestamp on the invoice row
    await supabase
      .from("invoices")
      .update({ last_sent_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API INVOICE SEND ERROR:", err);
    return NextResponse.json({ error: "Failed to send invoice." }, { status: 500 });
  }
}
