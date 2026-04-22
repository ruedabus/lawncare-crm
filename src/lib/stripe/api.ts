/**
 * Thin wrapper around Stripe's REST API using fetch.
 * Avoids needing the stripe npm package.
 */

const STRIPE_API = "https://api.stripe.com/v1";

function authHeader(secretKey?: string) {
  const key = secretKey ?? process.env.STRIPE_SECRET_KEY ?? "";
  return `Basic ${Buffer.from(key + ":").toString("base64")}`;
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
  amountCents: number;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
  /** Connected Stripe account ID (acct_...) — payment is routed to this account */
  connectedAccountId?: string;
  /** Platform fee in percent (e.g. 0.5 = 0.5%). Only applied when connectedAccountId is set. */
  platformFeePercent?: number;
};

export type CheckoutSession = {
  id: string;
  url: string;
};

/** Create a Stripe Checkout Session for a one-time invoice payment.
 *  When connectedAccountId is provided, funds are routed to that account
 *  (destination charge) and an optional platform fee is deducted first. */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSession> {
  const feePercent = params.platformFeePercent ?? 0;
  const feeAmount =
    params.connectedAccountId && feePercent > 0
      ? Math.round(params.amountCents * (feePercent / 100))
      : 0;

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
    ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
    // Destination charge — funds flow to connected account
    ...(params.connectedAccountId
      ? {
          "payment_intent_data[transfer_data][destination]":
            params.connectedAccountId,
          ...(feeAmount > 0
            ? { "payment_intent_data[application_fee_amount]": feeAmount }
            : {}),
        }
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

/** Exchange a Stripe Connect OAuth code for a stripe_user_id */
export async function exchangeConnectCode(
  code: string
): Promise<{ stripeUserId: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
  });

  const res = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error_description ?? data.error ?? "OAuth exchange failed");
  }

  return { stripeUserId: data.stripe_user_id };
}

/** Deauthorize a connected Stripe account from the platform */
export async function disconnectConnectedAccount(
  stripeAccountId: string
): Promise<void> {
  const clientId = process.env.STRIPE_CLIENT_ID ?? "";
  const body = new URLSearchParams({
    client_id: clientId,
    stripe_user_id: stripeAccountId,
  });

  await fetch("https://connect.stripe.com/oauth/deauthorize", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  // Non-fatal if this fails — we still clear the DB record
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

// ── Subscription helpers ──────────────────────────────────────────────────────

export type SubscriptionCheckoutParams = {
  priceId: string;
  customerEmail: string;
  trialDays: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

/** Create a Stripe Checkout Session for a subscription with a free trial */
export async function createSubscriptionCheckoutSession(
  params: SubscriptionCheckoutParams
): Promise<CheckoutSession> {
  const body = encode({
    mode: "subscription",
    "line_items[0][price]": params.priceId,
    "line_items[0][quantity]": 1,
    customer_email: params.customerEmail,
    "subscription_data[trial_period_days]": params.trialDays,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    // Collect payment method upfront even during trial
    "payment_method_collection": "always",
    ...(params.metadata
      ? Object.fromEntries(
          Object.entries(params.metadata).map(([k, v]) => [`metadata[${k}]`, v])
        )
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
        "Stripe subscription checkout failed"
    );
  }

  const data = await res.json();
  return { id: data.id, url: data.url };
}

/** Create a Stripe Billing Portal session so the user can manage their subscription */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const body = new URLSearchParams({
    customer: customerId,
    return_url: returnUrl,
  });

  const res = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ??
        "Billing portal session failed"
    );
  }

  const data = await res.json();
  return { url: data.url };
}
