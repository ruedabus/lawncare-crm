import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

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
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            YardPilot
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Business name — links to settings */}
          <Link
            href="/settings"
            className="hidden rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white sm:block"
          >
            {businessName}
          </Link>

          {/* User avatar — links to settings */}
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {initial}
            </div>
            {userEmail ? userEmail.split("@")[0] : "Owner"}
          </Link>
        </div>
      </div>
    </header>
  );
}
