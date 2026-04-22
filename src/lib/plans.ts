// ── Plan definitions ──────────────────────────────────────────────────────────
// Single source of truth for limits and feature flags per plan.

export type PlanName = "basic" | "pro" | "premier";

export interface PlanConfig {
  customerLimit: number | null;   // null = unlimited
  technicianLimit: number | null; // null = unlimited
  estimates: boolean;
  reports: boolean;
  multipleQrCodes: boolean;
  prioritySupport: boolean;
}

export const PLANS: Record<PlanName, PlanConfig> = {
  basic: {
    customerLimit: 50,
    technicianLimit: 1,
    estimates: false,
    reports: false,
    multipleQrCodes: false,
    prioritySupport: false,
  },
  pro: {
    customerLimit: 100,
    technicianLimit: 3,
    estimates: true,
    reports: true,
    multipleQrCodes: true,
    prioritySupport: false,
  },
  premier: {
    customerLimit: null,
    technicianLimit: null,
    estimates: true,
    reports: true,
    multipleQrCodes: true,
    prioritySupport: true,
  },
};

/** Returns the plan config for a given plan name. Defaults to basic if unknown. */
export function getPlanConfig(planName: string | null | undefined): PlanConfig {
  const key = (planName ?? "basic") as PlanName;
  return PLANS[key] ?? PLANS.basic;
}

/** Human-readable upgrade label */
export const UPGRADE_LABELS: Record<PlanName, string> = {
  basic: "Upgrade to Pro",
  pro: "Upgrade to Premier",
  premier: "You're on the top plan",
};
