export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-bold">{title}</h1>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}