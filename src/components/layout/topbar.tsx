type TopbarProps = {
  title: string;
};

export function Topbar({ title }: TopbarProps) {
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
          <div className="hidden rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 sm:block">
            ABC Landscaping
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              A
            </div>
            Owner
          </div>
        </div>
      </div>
    </header>
  );
}