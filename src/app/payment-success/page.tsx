export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Payment received!</h1>
        <p className="mt-3 text-slate-500">
          Thank you — your payment has been processed successfully. You will receive a confirmation email shortly.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Powered by YardPilot
        </p>
      </div>
    </div>
  );
}
