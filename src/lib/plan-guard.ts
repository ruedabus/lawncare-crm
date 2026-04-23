// ── Plan guard helpers (server-side only) ─────────────────────────────────────
// Use these in API routes and server components to check the current user's plan.
// When a team member is logged in, plan limits are always checked against the
// owner's account — pass `ownerId` to avoid a second DB round-trip.

import { createClient } from "./supabase/server";
import { getPlanConfig, type PlanConfig } from "./plans";
import { resolveOwnerId } from "./team";

export interface UserPlanInfo {
  planName: string;
  config: PlanConfig;
  subscriptionStatus: string | null;
}

/**
 * Fetch plan info from the settings table.
 * Pass `ownerId` (already resolved via getTeamContext) to avoid extra lookups.
 */
export async function getUserPlanInfo(ownerId?: string): Promise<UserPlanInfo> {
  const supabase = await createClient();

  let effectiveOwnerId = ownerId;
  if (!effectiveOwnerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { planName: "basic", config: getPlanConfig("basic"), subscriptionStatus: null };
    }
    effectiveOwnerId = await resolveOwnerId(supabase, user.id);
  }

  const { data: settings } = await supabase
    .from("settings")
    .select("plan_name, subscription_status")
    .eq("user_id", effectiveOwnerId)
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
export async function checkCustomerLimit(ownerId?: string): Promise<string | null> {
  const supabase = await createClient();

  let effectiveOwnerId = ownerId;
  if (!effectiveOwnerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Unauthorized";
    effectiveOwnerId = await resolveOwnerId(supabase, user.id);
  }

  const { config, planName } = await getUserPlanInfo(effectiveOwnerId);
  if (config.customerLimit === null) return null; // unlimited

  const { count } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", effectiveOwnerId);

  if ((count ?? 0) >= config.customerLimit) {
    return `You've reached the ${config.customerLimit}-customer limit on the ${planName} plan. Upgrade to add more customers.`;
  }
  return null;
}

/** Check if owner is within their team member limit. Returns null if OK, error message if over limit. */
export async function checkTeamMemberLimit(ownerId: string): Promise<string | null> {
  const supabase = await createClient();
  const { config, planName } = await getUserPlanInfo(ownerId);

  if (config.teamMemberLimit === null) return null; // unlimited

  if (config.teamMemberLimit === 0) {
    return `Your ${planName} plan does not include team members. Upgrade to Pro to add up to 2 team logins, or Premier for unlimited.`;
  }

  const { count } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", ownerId)
    .neq("status", "removed");

  if ((count ?? 0) >= config.teamMemberLimit) {
    return `You've reached the ${config.teamMemberLimit}-member limit on the ${planName} plan. Upgrade to Premier for unlimited team members.`;
  }
  return null;
}

/** Check if user is within their technician limit. Returns null if OK, error message if over limit. */
export async function checkTechnicianLimit(ownerId?: string): Promise<string | null> {
  const supabase = await createClient();

  let effectiveOwnerId = ownerId;
  if (!effectiveOwnerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Unauthorized";
    effectiveOwnerId = await resolveOwnerId(supabase, user.id);
  }

  const { config, planName } = await getUserPlanInfo(effectiveOwnerId);
  if (config.technicianLimit === null) return null; // unlimited

  const { count } = await supabase
    .from("technicians")
    .select("id", { count: "exact", head: true })
    .eq("user_id", effectiveOwnerId)
    .eq("is_active", true);

  if ((count ?? 0) >= config.technicianLimit) {
    return `You've reached the ${config.technicianLimit}-technician limit on the ${planName} plan. Upgrade to add more technicians.`;
  }
  return null;
}
