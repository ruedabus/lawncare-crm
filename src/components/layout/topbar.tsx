import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { MobileNav } from "./mobile-nav";

type TopbarProps = {
  title: string;
};

export async function Topbar({ title }: TopbarProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("settings")
    .select("business_name")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const businessName = settings?.business_name || "My Business";
  const userEmail = user?.email ?? "";
  const initial = userEmail.charAt(0).toUpperCase() || "U";

  return (
    <header className="border-b border-slate-800 bg-slate-950 px-4 py-3 text-white sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-3">

        {/* Left: hamburger (mobile) + title */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile nav drawer */}
          <MobileNav />

          <div className="min-w-0">
            <p className="hidden text-xs uppercase tracking-wide text-slate-400 sm:block">
              YardPilot
            </p>
            <h2 className="truncate text-lg font-semibold tracking-tight sm:text-2xl">
              {title}
            </h2>
          </div>
        </div>

        {/* Right: business name + avatar */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/settings"
            className="hidden rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white sm:block"
          >
            {businessName}
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {initial}
            </div>
            <span className="hidden sm:inline">
              {userEmail ? userEmail.split("@")[0] : "Owner"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
