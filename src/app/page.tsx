import Link from "next/link";

// ── Icons ─────────────────────────────────────────────────────────────────────

function Icon({ path, cls = "h-6 w-6" }: { path: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z",
    title: "Invoicing & Payments",
    description: "Create professional invoices in seconds and get paid online via Stripe. Customers pay with one click from their email.",
  },
  {
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    title: "Lead Management",
    description: "Track every lead from first contact to converted customer. Never let a potential job slip through the cracks again.",
  },
  {
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    title: "Job Scheduling",
    description: "Schedule jobs, assign technicians, and view your whole week at a glance. Crew members get automatic morning reminders.",
  },
  {
    icon: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z",
    title: "QR Lead Capture",
    description: "Print a QR code for your work truck or yard sign. Potential customers scan it and their info drops straight into your CRM.",
  },
  {
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    title: "Estimates",
    description: "Send polished estimates to prospects with a single click. Track status and convert accepted estimates into jobs automatically.",
  },
  {
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-6 3h.008v.008H6V15z",
    title: "Works on Mobile",
    description: "Install YardPilot to your phone's home screen like an app. Capture leads, check schedules, and create invoices from the field.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for solo operators just getting started.",
    highlight: false,
    features: [
      "Up to 25 customers",
      "Invoicing & online payments",
      "Lead management",
      "Job scheduling",
      "QR lead capture",
      "Mobile-ready PWA",
      "Email support",
    ],
    cta: "Get started free",
    ctaHref: "/login",
  },
  {
    name: "Premier",
    price: "$49",
    period: "/mo",
    description: "For growing crews who need more power.",
    highlight: true,
    features: [
      "Unlimited customers",
      "Everything in Starter",
      "Multiple technicians",
      "SMS technician reminders",
      "Multiple QR codes",
      "Lead source tracking",
      "Priority support",
    ],
    cta: "Start free trial",
    ctaHref: "/login",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/YardPilot-logo.png" alt="YardPilot" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50 px-6 py-24 text-center">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-100 opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100 opacity-60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Built for lawn care professionals
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            Run your lawn care
            <br />
            <span className="text-emerald-600">business smarter</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-slate-500">
            YardPilot handles invoices, leads, scheduling, and payments so you
            can spend less time on paperwork and more time on the grass.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Start for free
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>

          <p className="mt-5 text-sm text-slate-400">No credit card required · Set up in minutes</p>
        </div>
      </section>

      {/* ── Social proof strip ──────────────────────────────────────────────── */}
      <div className="border-y border-slate-100 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-slate-400">
          <span>✓ Stripe payments built in</span>
          <span>✓ Works on iPhone &amp; Android</span>
          <span>✓ No contracts</span>
          <span>✓ Cancel anytime</span>
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Features
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
              YardPilot is purpose-built for lawn care — not a generic CRM with
              a green logo.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon path={f.icon} cls="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ─────────────────────────────────────────────────────── */}
      <section className="bg-emerald-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <svg className="mx-auto mb-6 h-10 w-10 opacity-40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="mb-8 text-2xl font-medium leading-relaxed">
            "Before YardPilot I was writing invoices by hand and texting customers
            photos of them. Now everything is professional, payments come in
            automatically, and my guys know their schedule before they leave the house."
          </p>
          <div>
            <p className="font-semibold">Happy Grass, LLC</p>
            <p className="mt-1 text-sm text-emerald-200">YardPilot Pilot Client · Brooksville, FL</p>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Pricing
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Simple, honest pricing
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-500">
              Start free and upgrade when your business is ready to scale.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlight
                    ? "bg-slate-900 text-white shadow-xl"
                    : "border border-slate-200 bg-white shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold text-white shadow">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <p className={`mb-1 text-sm font-semibold uppercase tracking-widest ${plan.highlight ? "text-emerald-400" : "text-emerald-600"}`}>
                  {plan.name}
                </p>
                <div className="mb-2 flex items-end gap-1">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  {plan.period && (
                    <span className={`mb-1.5 text-lg ${plan.highlight ? "text-slate-400" : "text-slate-400"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mb-8 text-sm ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>
                  {plan.description}
                </p>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <svg className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-emerald-400" : "text-emerald-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.highlight ? "text-slate-300" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900">
            Ready to grow your business?
          </h2>
          <p className="mb-8 text-lg text-slate-500">
            Join lawn care pros already using YardPilot to save time, look
            professional, and get paid faster.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-emerald-600 px-10 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Get started free today
          </Link>
          <p className="mt-4 text-sm text-slate-400">No credit card required</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/YardPilot-logo.png" alt="YardPilot" className="h-8 w-auto" />
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} YardPilot. All rights reserved.
          </p>
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900">
            Log in →
          </Link>
        </div>
      </footer>

    </div>
  );
}
