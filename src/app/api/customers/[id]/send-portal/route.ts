import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { upsertPortalToken } from "../../../../../lib/portal-token";
import { sendEmail } from "../../../../../lib/email/send";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch customer + business settings in parallel
  const [{ data: customer }, { data: settings }] = await Promise.all([
    supabase.from("customers").select("id, name, email").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("settings").select("business_name, business_email, business_phone").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  if (!customer.email) {
    return NextResponse.json(
      { error: "This customer has no email address on file." },
      { status: 422 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const token = await upsertPortalToken(customer.id, user.id);
  const portalUrl = `${appUrl}/portal/${token}`;

  const businessName = settings?.business_name ?? "YardPilot";
  const businessEmail = settings?.business_email ?? "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#059669;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">YardPilot</p>
          </td>
        </tr>
        <tr><td style="padding:32px 32px 8px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Your customer portal is ready</p>
          <p style="margin:0;font-size:15px;color:#475569;">
            Hi ${customer.name}, ${businessName} has set up a personal portal for you where you can view your invoices, service history, and more.
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <a href="${portalUrl}" style="display:inline-block;background:#059669;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
            Open My Portal
          </a>
        </td></tr>
        <tr><td style="padding:0 32px 32px;font-size:13px;color:#64748b;">
          <p style="margin:0;">This link is personal and expires in 7 days. Do not share it with others.</p>
          ${businessEmail ? `<p style="margin:8px 0 0;">Questions? Contact us at <a href="mailto:${businessEmail}" style="color:#059669;">${businessEmail}</a>${settings?.business_phone ? ` or call ${settings.business_phone}` : ""}.</p>` : ""}
        </td></tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              This email was sent automatically by YardPilot.<br />Please do not reply directly to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const result = await sendEmail({
    to: customer.email,
    fromName: businessName,
    subject: `Your customer portal from ${businessName}`,
    html,
    replyTo: businessEmail || undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Email failed to send." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, portalUrl });
}
