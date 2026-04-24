import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { createClient } from "../../lib/supabase/server";
import { getTeamContext } from "../../lib/team";

type AppShellProps = {
  title: string;
  backHref?: string;
  children: React.ReactNode;
};

export async function AppShell({ title, backHref, children }: AppShellProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user
    ? (await getTeamContext(supabase, user.id)).role
    : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar role={role} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} backHref={backHref} />

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}