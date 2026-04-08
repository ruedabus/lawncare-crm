import Link from "next/link";
import { AppShell } from "../../../components/layout/app-shell";

export default function CustomerNotFoundPage() {
  return (
    <AppShell title="Customer Not Found">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Customer not found
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          The customer you are looking for does not exist.
        </p>
        <Link href="/customers" className="mt-4 inline-block underline">
          Back to Customers
        </Link>
      </div>
    </AppShell>
  );
}