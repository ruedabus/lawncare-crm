// ── Plan definitions ──────────────────────────────────────────────────────────
// Single source of truth for limits and feature flags per plan.

export type PlanName = "basic" | "pro" | "premier";

export interface PlanConfig {
  customerLimit: number | null;    // null = unlimited
  technicianLimit: number | null;  // null = unlimited
  teamMemberLimit: number | null;  // additional logins beyond the owner; null = unlimited
  estimates: boolean;
  reports: boolean;
  multipleQrCodes: boolean;
  prioritySupport: boolean;
  jobPhotos: boolean;              // before/after photo uploads on jobs
  reviewRequests: boolean;         // auto review request email on job completion
  weatherRescheduling: boolean;    // auto weather-aware rescheduling (coming soon)
}

export const PLANS: Record<PlanName, PlanConfig> = {
  basic: {
    customerLimit: 50,
    technicianLimit: 1,
    teamMemberLimit: 0,
    estimates: false,
    reports: false,
    multipleQrCodes: false,
    prioritySupport: false,
    jobPhotos: false,
    reviewRequests: false,
    weatherRescheduling: false,
  },
  pro: {
    customerLimit: 100,
    technicianLimit: 3,
    teamMemberLimit: 2,
    estimates: true,
    reports: true,
    multipleQrCodes: true,
    prioritySupport: false,
    jobPhotos: true,
    reviewRequests: true,
    weatherRescheduling: false,
  },
  premier: {
    customerLimit: null,
    technicianLimit: null,
    teamMemberLimit: null,
    estimates: true,
    reports: true,
    multipleQrCodes: true,
    prioritySupport: true,
    jobPhotos: true,
    reviewRequests: true,
    weatherRescheduling: true,   // will be built next session
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
