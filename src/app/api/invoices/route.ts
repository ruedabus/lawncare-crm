import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { sendEmail } from "../../../lib/email/send";
import { buildInvoiceEmailData } from "../../../lib/email/invoice-email-data";
import { invoiceCreatedEmail } from "../../../lib/email/templates";

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
          user_id: user?.id ?? null,
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
    if (user) {
      buildInvoiceEmailData(supabase, data.id, user.id).then((emailData) => {
        if (!emailData) return;
        sendEmail({
          to: emailData.customerEmail,
          fromName: emailData.businessName,
          subject: `Invoice ${emailData.invoiceNumber} from ${emailData.businessName}`,
          html: invoiceCreatedEmail(emailData),
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
