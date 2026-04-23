import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
  title: string;
  backHref?: string;
  children: React.ReactNode;
};

export function AppShell({ title, backHref, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

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