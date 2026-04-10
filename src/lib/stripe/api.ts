/**
 * Thin wrapper around Stripe's REST API using fetch.
 * Avoids needing the stripe npm package.
 */

const STRIPE_API = "https://api.stripe.com/v1";

function authHeader() {
  return `Basic ${Buffer.from(process.env.STRIPE_SECRET_KEY + ":").toString("base64")}`;
}

/** Encode a plain object as application/x-www-form-urlencoded (Stripe's required format) */
function encode(obj: Record<string, string | number | undefined>, prefix = ""): string {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      const key = prefix ? `${prefix}[${k}]` : k;
      if (typeof v === "object" && v !== null) {
        return encode(v as Record<string, string | number>, key);
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`;
    })
    .join("&");
}

export type CheckoutSessionParams = {
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number; // e.g. 15000 for $150.00
  customerEmail?: string;
  customerName?: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSession = {
  id: string;
  url: string;
};

/** Create a Stripe Checkout Session for a one-time invoice payment */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSession> {
  const body = encode({
    mode: "payment",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": params.invoiceNumber,
    "line_items[0][price_data][product_data][description]":
      params.description ?? "Lawn care services",
    "line_items[0][price_data][unit_amount]": params.amountCents,
    "line_items[0][quantity]": 1,
    "metadata[invoice_id]": params.invoiceId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...(params.customerEmail
      ? { customer_email: params.customerEmail }
      : {}),
  });

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ??
        "Stripe checkout failed"
    );
  }

  const data = await res.json();
  return { id: data.id, url: data.url };
}

/** Verify a Stripe webhook signature using HMAC-SHA256 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const { createHmac, timingSafeEqual } = await import("crypto");
    const parts = signature.split(",");
    const ts = parts.find((p) => p.startsWith("t="))?.slice(2);
    const sigs = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));

    if (!ts || sigs.length === 0) return false;

    // Reject timestamps older than 5 minutes (replay attack protection)
    const age = Date.now() / 1000 - Number(ts);
    if (age > 300) return false;

    const signed = `${ts}.${payload}`;
    const expected = createHmac("sha256", secret).update(signed).digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");

    return sigs.some((s) => {
      try {
        const sBuf = Buffer.from(s, "hex");
        return (
          sBuf.length === expectedBuf.length &&
          timingSafeEqual(sBuf, expectedBuf)
        );
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}
