/**
 * Twilio SMS helper
 *
 * Requires three environment variables:
 *   TWILIO_ACCOUNT_SID   — your Account SID from console.twilio.com
 *   TWILIO_AUTH_TOKEN    — your Auth Token from console.twilio.com
 *   TWILIO_PHONE_NUMBER  — your Twilio number in E.164 format, e.g. +12105550100
 *
 * If any variable is missing the function logs a warning and returns ok: false
 * (so the rest of the cron keeps running even if Twilio isn't wired up yet).
 */

export interface SmsResult {
  ok: boolean;
  sid?: string;
  error?: string;
}

/**
 * Normalise a phone number to E.164 (+1XXXXXXXXXX for US numbers).
 * Returns null if it can't be cleaned up.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Strip everything except digits and leading +
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 11) return null; // probably not a US number we can handle
  return null;
}

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[sms] Twilio env vars not set — skipping SMS send.");
    return { ok: false, error: "Twilio not configured" };
  }

  const toNormalized = normalizePhone(to);
  if (!toNormalized) {
    console.warn(`[sms] Could not normalise phone number: ${to}`);
    return { ok: false, error: `Invalid phone number: ${to}` };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams({
      To: toNormalized,
      From: fromNumber,
      Body: body,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const json = await res.json() as { sid?: string; message?: string; code?: number };

    if (!res.ok) {
      const errMsg = json.message ?? `HTTP ${res.status}`;
      console.error(`[sms] Twilio error for ${toNormalized}: ${errMsg}`);
      return { ok: false, error: errMsg };
    }

    return { ok: true, sid: json.sid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[sms] sendSms threw: ${msg}`);
    return { ok: false, error: msg };
  }
}
