import Link from "next/link";

export default function TrialSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-slate-900">You&apos;re in!</h1>
      <p className="mt-3 max-w-md text-lg text-slate-600">
        Your 14-day free trial has started. Check your email for a link to set your password and access YardPilot.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Didn&apos;t get the email? Check your spam folder or contact{" "}
        <a href="mailto:support@yardpilot.net" className="text-emerald-600 underline">
          support@yardpilot.net
        </a>.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Go to login
      </Link>
    </div>
  );
}
