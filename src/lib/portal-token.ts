import { createServiceClient } from "./supabase/server";

/** Generate a secure random token string */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Create or refresh a portal token for a customer. Returns the token string. */
export async function upsertPortalToken(
  customerId: string,
  userId: string
): Promise<string> {
  const supabase = createServiceClient();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // Delete any existing token for this customer first
  await supabase.from("portal_tokens").delete().eq("customer_id", customerId);

  // Insert fresh token
  const { error } = await supabase.from("portal_tokens").insert({
    token,
    customer_id: customerId,
    user_id: userId,
    expires_at: expiresAt,
  });

  if (error) throw new Error(`Failed to create portal token: ${error.message}`);
  return token;
}

/** Get an existing valid portal token or create a new one. Preserves existing tokens so emailed links stay valid. */
export async function getOrCreatePortalToken(
  customerId: string,
  userId: string
): Promise<string> {
  const supabase = createServiceClient();

  // Try to find a valid (non-expired) existing token
  const { data: existing } = await supabase
    .from("portal_tokens")
    .select("token, expires_at")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (existing && new Date(existing.expires_at) > new Date()) {
    return existing.token;
  }

  // None or expired — create a fresh one
  return upsertPortalToken(customerId, userId);
}

/** Validate a token and return the associated customer_id and user_id, or null if invalid/expired. */
export async function validatePortalToken(
  token: string
): Promise<{ customerId: string; userId: string } | null> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("portal_tokens")
    .select("customer_id, user_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  return { customerId: data.customer_id, userId: data.user_id };
}
