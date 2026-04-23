// ── Multi-user team context helpers (server-side only) ────────────────────────
// Every API route and server page that reads/writes owner data should call
// getTeamContext() after auth.getUser() and use `ownerId` in DB queries
// instead of `user.id`.
//
// Roles:
//   null        = the authenticated user IS the account owner
//   "admin"     = full CRM access except billing & team management
//   "dispatcher"= customers (read), jobs (read/write), schedule — no invoices/billing
//   "technician"= only assigned jobs, read + status update

import type { SupabaseClient } from "@supabase/supabase-js";

export type TeamRole = "admin" | "dispatcher" | "technician";

export interface TeamContext {
  /** The owner's user_id — always use this for DB queries */
  ownerId: string;
  /** null if the current user IS the owner */
  role: TeamRole | null;
  /** team_members.id if they're a member, null if owner */
  memberId: string | null;
}

/**
 * Resolves the effective owner user_id for the given authenticated userId.
 * Returns the owner's ID and the caller's role (null = they ARE the owner).
 */
export async function getTeamContext(
  supabase: SupabaseClient,
  userId: string
): Promise<TeamContext> {
  const { data } = await supabase
    .from("team_members")
    .select("id, owner_user_id, role")
    .eq("member_user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (data) {
    return {
      ownerId: data.owner_user_id as string,
      role: data.role as TeamRole,
      memberId: data.id as string,
    };
  }

  return { ownerId: userId, role: null, memberId: null };
}

/** Shorthand — returns just the owner's user_id */
export async function resolveOwnerId(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { ownerId } = await getTeamContext(supabase, userId);
  return ownerId;
}

// ── Permission helpers ────────────────────────────────────────────────────────

/** Returns true if this user IS the account owner */
export function isOwner(ctx: TeamContext): boolean {
  return ctx.role === null;
}

/** Can create / edit / delete CRM records (owner + admin) */
export function canWrite(ctx: TeamContext): boolean {
  return ctx.role === null || ctx.role === "admin";
}

/** Can read invoices (owner + admin) — dispatchers & technicians cannot */
export function canReadInvoices(ctx: TeamContext): boolean {
  return ctx.role === null || ctx.role === "admin";
}

/** Billing & subscription management — owner only */
export function canAccessBilling(ctx: TeamContext): boolean {
  return ctx.role === null;
}

/** Team member management — owner only */
export function canManageTeam(ctx: TeamContext): boolean {
  return ctx.role === null;
}

/** Can read/update jobs (everyone except no access for technician on others' jobs) */
export function canAccessJobs(ctx: TeamContext): boolean {
  return true; // all roles can access jobs (technician filtered by assigned_to in UI)
}

/** Can view the schedule page */
export function canAccessSchedule(ctx: TeamContext): boolean {
  return ctx.role === null || ctx.role === "admin" || ctx.role === "dispatcher";
}
