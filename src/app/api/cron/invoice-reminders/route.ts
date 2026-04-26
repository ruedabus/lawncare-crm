import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { sendEmail } from "../../../../lib/email/send";
import { buildInvoiceEmailData } from "../../../../lib/email/invoice-email-data";
import { invoiceReminderEmail } from "../../../../lib/email/templates";
import { getPlanConfig } from "../../../../lib/plans";

/**
 * GET /api/cron/invoice-reminders
 *
 * Sends automated payment reminder emails for unpaid invoices:
 *   - 7-day reminder  — invoice created 7+ days ago, never reminded at 7 days
 *   - 14-day reminder — invoice created 14+ days ago, never reminded at 14 days
 *
 * Each reminder fires exactly once per invoice (tracked via reminder_7_sent_at
 * and reminder_14_sent_at columns on the invoices table).
 *
 * Only runs for owners on Pro or Premier plans who have payment_reminders_enabled = true.
 *
 * Called automatically by Vercel Cron (vercel.json) every day at 8 AM ET.
 * Secured via CRON_SECRET env var.
 */
export async function GET(request: Request) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceClient();
  const admin = supabase; // service client bypasses RLS for all queries

  const now = new Date();

  function daysAgo(n: number): string {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  // ── Find invoices needing 7-day reminder ───────────────────────────────────
  const { data: need7 } = await admin
    .from("invoices")
    .select("id, user_id, created_at")
    .eq("status", "unpaid")
    .is("reminder_7_sent_at", null)
    .lte("created_at", daysAgo(7));

  // ── Find invoices needing 14-day reminder ──────────────────────────────────
  const { data: need14 } = await admin
    .from("invoices")
    .select("id, user_id, created_at")
    .eq("status", "unpaid")
    .is("reminder_14_sent_at", null)
    .lte("created_at", daysAgo(14));

  // ── Load all owner settings in one query ───────────────────────────────────
  const allOwnerIds = [
    ...new Set([
      ...(need7 ?? []).map((i) => i.user_id as string),
      ...(need14 ?? []).map((i) => i.user_id as string),
    ]),
  ];

  if (allOwnerIds.length === 0) {
    return NextResponse.json({ sent: 0, message: "No invoices need reminders." });
  }

  const { data: settingsRows } = await admin
    .from("settings")
    .select("user_id, plan_name, payment_reminders_enabled")
    .in("user_id", allOwnerIds);

  const settingsMap = new Map(
    (settingsRows ?? []).map((s) => [s.user_id as string, s])
  );

  // ── Helper: check if owner is eligible ────────────────────────────────────
  function ownerEligible(ownerId: string): boolean {
    const s = settingsMap.get(ownerId);
    if (!s) return false;
    // payment_reminders_enabled defaults to true if not set
    if (s.payment_reminders_enabled === false) return false;
    const config = getPlanConfig(s.plan_name);
    return config.paymentReminders;
  }

  let sent = 0;
  const errors: string[] = [];

  // ── Send 7-day reminders ───────────────────────────────────────────────────
  for (const inv of need7 ?? []) {
    if (!ownerEligible(inv.user_id)) continue;

    const emailData = await buildInvoiceEmailData(supabase, inv.id, inv.user_id);
    if (!emailData) continue;

    const result = await sendEmail({
      to: emailData.customerEmail,
      fromName: emailData.businessName,
      subject: `Friendly reminder: Invoice ${emailData.invoiceNumber} is unpaid`,
      html: invoiceReminderEmail(emailData, "overdue", 7),
      replyTo: emailData.businessEmail || undefined,
    });

    if (result.ok) {
      sent++;
      await admin
        .from("invoices")
        .update({ reminder_7_sent_at: now.toISOString() })
        .eq("id", inv.id);
    } else {
      errors.push(`7d ${inv.id}: ${result.error}`);
    }
  }

  // ── Send 14-day reminders ──────────────────────────────────────────────────
  for (const inv of need14 ?? []) {
    if (!ownerEligible(inv.user_id)) continue;

    const emailData = await buildInvoiceEmailData(supabase, inv.id, inv.user_id);
    if (!emailData) continue;

    const result = await sendEmail({
      to: emailData.customerEmail,
      fromName: emailData.businessName,
      subject: `Second notice: Invoice ${emailData.invoiceNumber} remains unpaid`,
      html: invoiceReminderEmail(emailData, "overdue", 14),
      replyTo: emailData.businessEmail || undefined,
    });

    if (result.ok) {
      sent++;
      await admin
        .from("invoices")
        .update({ reminder_14_sent_at: now.toISOString() })
        .eq("id", inv.id);
    } else {
      errors.push(`14d ${inv.id}: ${result.error}`);
    }
  }

  console.log(`[cron] payment-reminders: sent=${sent} errors=${errors.length}`);
  return NextResponse.json({ sent, errors });
}
