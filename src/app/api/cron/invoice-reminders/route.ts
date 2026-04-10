import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { sendEmail } from "../../../../lib/email/send";
import { buildInvoiceEmailData } from "../../../../lib/email/invoice-email-data";
import { invoiceReminderEmail } from "../../../../lib/email/templates";

/**
 * GET /api/cron/invoice-reminders
 *
 * Sends payment reminder emails for unpaid invoices:
 *   - "upcoming"  — due in exactly 3 days
 *   - "due_today" — due today
 *   - "overdue"   — due 1, 3, or 7 days ago (avoids spamming daily)
 *
 * Called automatically by Vercel Cron (see vercel.json) every day at 8 AM.
 * Can also be triggered manually by hitting the URL with the secret header.
 *
 * Security: requires the CRON_SECRET env var as a Bearer token
 * so random callers cannot trigger mass emails.
 */
export async function GET(request: Request) {
  // Verify cron secret (set CRON_SECRET in your .env / Vercel env vars)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isoDate(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);

  const minus1 = new Date(today);
  minus1.setDate(today.getDate() - 1);
  const minus3 = new Date(today);
  minus3.setDate(today.getDate() - 3);
  const minus7 = new Date(today);
  minus7.setDate(today.getDate() - 7);

  // Fetch all unpaid invoices with a due_date in our target windows
  const targetDates = [
    isoDate(in3Days),   // upcoming
    isoDate(today),     // due today
    isoDate(minus1),    // 1 day overdue
    isoDate(minus3),    // 3 days overdue
    isoDate(minus7),    // 7 days overdue
  ];

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, due_date, customer_id, customers(id, email)")
    .eq("status", "unpaid")
    .in("due_date", targetDates);

  if (error) {
    console.error("[cron] invoice fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!invoices || invoices.length === 0) {
    return NextResponse.json({ sent: 0, message: "No invoices to remind." });
  }

  // We need a user_id to look up business settings.
  // Use the owner of each invoice's customer record.
  // For a single-owner app this is always the same user, but we fetch it properly.
  const { data: settingsRows } = await supabase
    .from("settings")
    .select("user_id, business_name, business_email");

  const ownerUserId = settingsRows?.[0]?.user_id as string | undefined;
  if (!ownerUserId) {
    return NextResponse.json(
      { error: "No settings row found — cannot look up business info." },
      { status: 500 }
    );
  }

  let sent = 0;
  const errors: string[] = [];

  for (const inv of invoices) {
    const customer = inv.customers as { id: string; email: string | null } | null;
    if (!customer?.email) continue; // skip — no email on file

    const dueDate = inv.due_date as string;
    let type: "upcoming" | "due_today" | "overdue";

    if (dueDate === isoDate(in3Days)) {
      type = "upcoming";
    } else if (dueDate === isoDate(today)) {
      type = "due_today";
    } else {
      type = "overdue";
    }

    const emailData = await buildInvoiceEmailData(supabase, inv.id, ownerUserId);
    if (!emailData) continue;

    const subject =
      type === "upcoming"
        ? `Reminder: Invoice ${emailData.invoiceNumber} due in 3 days`
        : type === "due_today"
        ? `Your invoice ${emailData.invoiceNumber} is due today`
        : `Overdue: Invoice ${emailData.invoiceNumber} needs attention`;

    const result = await sendEmail({
      to: emailData.customerEmail,
      fromName: emailData.businessName,
      subject,
      html: invoiceReminderEmail(emailData, type),
      replyTo: emailData.businessEmail || undefined,
    });

    if (result.ok) {
      sent++;
    } else {
      errors.push(`${inv.id}: ${result.error}`);
    }
  }

  console.log(`[cron] invoice-reminders: sent=${sent} errors=${errors.length}`);
  return NextResponse.json({ sent, errors });
}
