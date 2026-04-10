import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { sendEmail } from "../../../../lib/email/send";
import { buildInvoiceEmailData } from "../../../../lib/email/invoice-email-data";
import { invoicePaidEmail } from "../../../../lib/email/templates";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("SUPABASE INVOICE UPDATE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send "paid" confirmation email (fire-and-forget)
    if (status === "paid" && user) {
      buildInvoiceEmailData(supabase, id, user.id).then((emailData) => {
        if (!emailData) return;
        sendEmail({
          to: emailData.customerEmail,
          fromName: emailData.businessName,
          subject: `Payment received — ${emailData.invoiceNumber}`,
          html: invoicePaidEmail(emailData),
          replyTo: emailData.businessEmail || undefined,
        });
      }).catch(console.error);
    }

    return NextResponse.json({ invoice: data }, { status: 200 });
  } catch (err) {
    console.error("API INVOICE PATCH ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update invoice." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) {
      console.error("SUPABASE INVOICE DELETE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("API INVOICE DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete invoice." },
      { status: 500 }
    );
  }
}
