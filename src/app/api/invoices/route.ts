import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { sendEmail } from "../../../lib/email/send";
import { buildInvoiceEmailData } from "../../../lib/email/invoice-email-data";
import { invoiceCreatedEmail } from "../../../lib/email/templates";
import { createCheckoutSession } from "../../../lib/stripe/api";
import { getTeamContext, canWrite } from "../../../lib/team";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, job_id, title, amount, due_date, notes } = body;

    if (!customer_id || !title || !title.trim()) {
      return NextResponse.json(
        { error: "Customer and invoice title are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const teamCtx = await getTeamContext(supabase, user.id);
    if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    const { ownerId } = teamCtx;

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      return NextResponse.json(
        { error: "Amount must be a valid number." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          user_id: ownerId,
          customer_id,
          job_id: job_id || null,
          title: title.trim(),
          amount: parsedAmount,
          due_date: due_date || null,
          notes: notes?.trim() || null,
          status: "unpaid",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE INVOICE INSERT ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-send invoice email (fire-and-forget — don't block the response)
    {
      buildInvoiceEmailData(supabase, data.id, ownerId).then(async (emailData) => {
        if (!emailData) return;

        // Generate a Stripe Pay Now URL to embed in the email
        let payUrl: string | undefined;
        if (process.env.STRIPE_SECRET_KEY && emailData.amount > 0) {
          try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
            const session = await createCheckoutSession({
              invoiceId: data.id,
              invoiceNumber: emailData.invoiceNumber,
              amountCents: Math.round(emailData.amount * 100),
              customerEmail: emailData.customerEmail,
              customerName: emailData.customerName,
              description: emailData.invoiceTitle,
              successUrl: `${appUrl}/payment-success?invoice=${data.id}`,
              cancelUrl: `${appUrl}/payment-cancelled`,
            });
            payUrl = session.url;
          } catch {
            // Non-fatal
          }
        }

        sendEmail({
          to: emailData.customerEmail,
          fromName: emailData.businessName,
          subject: `Invoice ${emailData.invoiceNumber} from ${emailData.businessName}`,
          html: invoiceCreatedEmail({ ...emailData, payUrl }),
          replyTo: emailData.businessEmail || undefined,
        });
      }).catch(console.error);
    }

    return NextResponse.json({ invoice: data }, { status: 201 });
  } catch (err) {
    console.error("API INVOICE POST ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create invoice." },
      { status: 500 }
    );
  }
}
