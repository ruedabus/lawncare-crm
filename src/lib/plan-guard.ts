// ── Plan guard helpers (server-side only) ─────────────────────────────────────
// Use these in API routes and server components to check the current user's plan.

import { createClient } from "./supabase/server";
import { getPlanConfig, type PlanConfig } from "./plans";

export interface UserPlanInfo {
  planName: string;
  config: PlanConfig;
  subscriptionStatus: string | null;
}

/** Fetch the authenticated user's plan info from the settings table. */
export async function getUserPlanInfo(): Promise<UserPlanInfo> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { planName: "basic", config: getPlanConfig("basic"), subscriptionStatus: null };
  }

  const { data: settings } = await supabase
    .from("settings")
    .select("plan_name, subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const planName = settings?.plan_name ?? "basic";
  const subscriptionStatus = settings?.subscription_status ?? null;

  return {
    planName,
    config: getPlanConfig(planName),
    subscriptionStatus,
  };
}

/** Check if the user has access to a feature. Returns null if allowed, or an error message if blocked. */
export async function checkFeatureAccess(
  feature: keyof Pick<PlanConfig, "estimates" | "reports" | "multipleQrCodes">
): Promise<string | null> {
  const { config, planName } = await getUserPlanInfo();
  if (config[feature]) return null;
  return `Your ${planName} plan does not include this feature. Upgrade to Pro or Premier to unlock it.`;
}

/** Check if user is within their customer limit. Returns null if OK, error message if over limit. */
export async function checkCustomerLimit(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Unauthorized";

  const { config, planName } = await getUserPlanInfo();
  if (config.customerLimit === null) return null; // unlimited

  const { count } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= config.customerLimit) {
    return `You've reached the ${config.customerLimit}-customer limit on the ${planName} plan. Upgrade to add more customers.`;
  }
  return null;
}

/** Check if user is within their technician limit. Returns null if OK, error message if over limit. */
export async function checkTechnicianLimit(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Unauthorized";

  const { config, planName } = await getUserPlanInfo();
  if (config.technicianLimit === null) return null; // unlimited

  const { count } = await supabase
    .from("technicians")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if ((count ?? 0) >= config.technicianLimit) {
    return `You've reached the ${config.technicianLimit}-technician limit on the ${planName} plan. Upgrade to add more technicians.`;
  }
  return null;
}
