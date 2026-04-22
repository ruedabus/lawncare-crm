"use client";

import Link from "next/link";

interface UpgradeWallProps {
  feature: string;
  description: string;
  currentPlan: string;
}

export function UpgradeWall({ feature, description, currentPlan }: UpgradeWallProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">{feature} is a Pro feature</h2>
      <p className="mt-3 max-w-md text-slate-500">{description}</p>

      <div className="mt-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 capitalize">
        Your plan: {currentPlan}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/settings?tab=billing"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          Upgrade your plan →
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
