/**
 * Thin wrapper around the Resend REST API.
 * No package required — uses native fetch.
 *
 * Setup:
 *   1. Sign up at https://resend.com (free — 3,000 emails/month)
 *   2. Add mail.yardpilot.net as a domain in the Resend dashboard
 *   3. Add the DNS records Resend gives you at your domain registrar
 *   4. Set RESEND_API_KEY=re_... in your .env.local
 *   5. Set RESEND_FROM_DOMAIN=mail.yardpilot.net in your .env.local
 *
 * Each email is sent as:
 *   "Sunshine Lawn Care" <invoices@mail.yardpilot.net>
 * with reply-to set to the business owner's own email address,
 * so customer replies go directly to the lawn care business.
 */

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  /** Display name shown in the From field — e.g. "Sunshine Lawn Care" */
  fromName?: string;
  /** Reply-to address — should be the business owner's email */
  replyTo?: string;
};

export async function sendEmail(
  payload: EmailPayload
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send.");
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  // Build the from address:
  //   "Sunshine Lawn Care" <invoices@mail.yardpilot.net>
  // Falls back to plain address if no domain is configured yet.
  const fromDomain =
    process.env.RESEND_FROM_DOMAIN ?? process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const fromAddress = fromDomain.includes("@")
    ? fromDomain // legacy plain address
    : `invoices@${fromDomain}`; // e.g. invoices@mail.yardpilot.net

  const fromField =
    payload.fromName
      ? `${payload.fromName} <${fromAddress}>`
      : fromAddress;

  const body = {
    from: fromField,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    html: payload.html,
    ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg =
        (data as { message?: string }).message ?? `HTTP ${res.status}`;
      console.error("[email] Resend error:", msg);
      return { ok: false, error: msg };
    }

    return { ok: true };
  } catch (err) {
    console.error("[email] fetch error:", err);
    return { ok: false, error: String(err) };
  }
}
