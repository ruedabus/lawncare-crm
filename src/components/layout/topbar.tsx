type TopbarProps = {
  title: string;
};

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">
          Owner
        </div>
      </div>
    </header>
  );
}