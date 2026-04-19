import Link from "next/link";

// ── Icons ─────────────────────────────────────────────────────────────────────

function Icon({ path, cls = "h-6 w-6" }: { path: string; cls?: string }) {
  return (
    <svg
      className={cls}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z",
    title: "Invoicing & Payments",
    description:
      "Create polished invoices in seconds and get paid online with Stripe. Customers can pay right from their email.",
  },
  {
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    title: "Lead Management",
    description:
      "Track every lead from first contact to closed job so opportunities never slip through the cracks.",
  },
  {
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    title: "Scheduling",
    description:
      "Schedule jobs, assign techs, and see the week at a glance so the whole crew stays on track.",
  },
  {
    icon: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z",
    title: "QR Lead Capture",
    description:
      "Put a QR code on trucks and signs so new customers can scan, submit, and land directly in your CRM.",
  },
  {
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    title: "Estimates",
    description:
      "Send professional estimates fast and convert approved work into scheduled jobs without re-entering everything.",
  },
  {
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-6 3h.008v.008H6V15z",
    title: "Mobile Ready",
    description:
      "Run the business from the field with a phone-friendly experience your crew can actually use.",
  },
];

const PLANS = [
  {
    name: "Basic",
    price: "$29.99",
    period: "/mo",
    description: "Perfect for solo operators getting organized.",
    highlight: false,
    features: [
      "Up to 50 customers",
      "Invoices & online payments",
      "Lead management",
      "Job scheduling",
      "QR lead capture",
      "Mobile-ready access",
      "Email support",
    ],
    cta: "Start free trial",
    ctaHref: "/start-trial",
  },
  {
    name: "Pro",
    price: "$39.99",
    period: "/mo",
    description: "Best for growing lawn care businesses.",
    highlight: true,
    features: [
      "Up to 100 customers",
      "Everything in Basic",
      "Multiple technicians",
      "SMS tech reminders",
      "Lead source tracking",
      "Priority support",
    ],
    cta: "Start free trial",
    ctaHref: "/start-trial",
  },
  {
    name: "Premier",
    price: "$59.99",
    period: "/mo",
    description: "For teams that want unlimited scale.",
    highlight: false,
    features: [
      "Unlimited customers",
      "Everything in Pro",
      "Advanced reporting",
      "Multiple QR codes",
      "Priority support",
    ],
    cta: "Start free trial",
    ctaHref: "/start-trial",
  },
];

// ── Small UI ─────────────────────────────────────────────────────────────────

function Check({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.414l-7.07 7.07a1 1 0 01-1.414 0L3.296 8.85A1 1 0 114.71 7.436l4.217 4.217 6.363-6.363a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/YardPilot-logo.png"
              alt="YardPilot"
              className="h-20 w-auto sm:h-24"
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/start-trial"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition hover:bg-emerald-500"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_28%),linear-gradient(to_bottom,#ffffff,rgba(236,253,245,0.9))]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute right-[-8rem] top-16 h-80 w-80 rounded-full bg-slate-200/50 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/70 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Built for lawn care professionals
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Win more jobs.
              <span className="block text-emerald-600">Get paid faster.</span>
              <span className="block text-slate-950">Stay organized.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              YardPilot helps lawn care businesses manage leads, customers,
              scheduling, invoices, and payments in one clean system.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/start-trial"
                className="inline-flex min-w-[190px] items-center justify-center rounded-2xl bg-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-[0_20px_50px_rgba(16,185,129,0.28)] transition hover:bg-emerald-500"
              >
                Start free trial
              </Link>
              <a
                href="#demo"
                className="inline-flex min-w-[190px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Watch demo
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                Set up in minutes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Real product preview */}
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-[0_30px_100px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/70 backdrop-blur">
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/screenshots/dashboard.png"
                  alt="YardPilot dashboard preview"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Screenshots Section ───────────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
              Product Tour
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              See YardPilot in action
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Manage your entire lawn care business — from leads to scheduling
              to getting paid.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/dashboard.png"
                alt="YardPilot dashboard"
                className="w-full"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-950">
                  Dashboard
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  See customers, jobs, invoices, and revenue all in one place.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/schedule.png"
                alt="YardPilot schedule"
                className="w-full"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-950">
                  Scheduling
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Organize your week and assign jobs to your crew with ease.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/invoices.png"
                alt="YardPilot invoices"
                className="w-full"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-950">
                  Invoices & Payments
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Send professional invoices and get paid faster.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/leads.png"
                alt="YardPilot leads"
                className="w-full"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-950">
                  Lead Tracking
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Capture and track every potential customer from first contact
                  to close.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo Section ──────────────────────────────────────────────────── */}
      <section id="demo" className="bg-slate-50 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
              Demo
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Watch YardPilot in action
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              See how a lawn care business manages jobs, customers, and payments
              in under a minute.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-black shadow-xl">
            <video
              controls
              preload="metadata"
              className="w-full"
              poster="/screenshots/dashboard.png"
            >
              <source src="/demo/yardpilot-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-5 text-sm font-medium text-slate-500 lg:px-8">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Stripe payments built in
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Mobile-ready PWA
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            QR lead capture
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Daily tech reminders
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Multi-factor login security
          </span>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────── */}
      <section id="features" className="bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
              Features
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Everything your crew needs
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              Built specifically for lawn care — not a generic tool bolted
              together. Every feature is designed around how you actually work.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                  <Icon path={f.icon} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-6 text-slate-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial band ─────────────────────────────── */}
      <section className="bg-emerald-700 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <svg
            className="mx-auto mb-6 h-10 w-10 text-emerald-300 opacity-60"
            fill="currentColor"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M10 8C6.7 8 4 10.7 4 14v10h10V14H7c0-1.7 1.3-3 3-3V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-7c0-1.7 1.3-3 3-3V8z" />
          </svg>
          <p className="text-2xl font-medium leading-relaxed text-white sm:text-3xl">
            "I used to run everything in a notebook and text messages. YardPilot
            gave me three extra hours a week back and my customers actually pay
            faster now."
          </p>
          <p className="mt-8 text-base font-semibold text-emerald-200">
            Marcus D. — Solo lawn care operator, Texas
          </p>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" className="bg-slate-50 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
              Pricing
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Simple, honest pricing
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Start free. Scale when you're ready. No hidden fees.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={[
                  "relative flex flex-col rounded-2xl border p-8 shadow-sm",
                  plan.highlight
                    ? "border-emerald-500 bg-emerald-700 text-white shadow-[0_20px_60px_rgba(16,185,129,0.22)]"
                    : "border-slate-200 bg-white",
                ].join(" ")}
              >
                {plan.highlight && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-4 py-1 text-xs font-semibold text-emerald-900 shadow">
                    Most popular
                  </span>
                )}
                <p
                  className={[
                    "text-sm font-semibold uppercase tracking-widest",
                    plan.highlight ? "text-emerald-300" : "text-emerald-600",
                  ].join(" ")}
                >
                  {plan.name}
                </p>
                <div className="mt-3 flex items-end gap-1">
                  <span
                    className={[
                      "text-5xl font-extrabold",
                      plan.highlight ? "text-white" : "text-slate-950",
                    ].join(" ")}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={[
                      "mb-1 text-sm",
                      plan.highlight ? "text-emerald-200" : "text-slate-500",
                    ].join(" ")}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={[
                    "mt-2 text-sm",
                    plan.highlight ? "text-emerald-100" : "text-slate-500",
                  ].join(" ")}
                >
                  {plan.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check
                        className={[
                          "mt-0.5 h-4 w-4 shrink-0",
                          plan.highlight
                            ? "text-emerald-300"
                            : "text-emerald-500",
                        ].join(" ")}
                      />
                      <span
                        className={
                          plan.highlight ? "text-emerald-50" : "text-slate-600"
                        }
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaHref}
                  className={[
                    "mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition",
                    plan.highlight
                      ? "bg-white text-emerald-700 hover:bg-emerald-50"
                      : "bg-emerald-600 text-white hover:bg-emerald-500",
                  ].join(" ")}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── User Manual download ────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-8 py-10 text-center sm:flex-row sm:text-left">
            {/* Book icon */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-950">
                YardPilot User Manual
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                Everything you need to get the most out of YardPilot — from
                onboarding your first customer to setting up QR lead capture,
                MFA security, Stripe payments, and technician reminders. 15
                chapters, fully illustrated.
              </p>
            </div>

            <a
              href="/YardPilot-User-Manual.docx"
              download
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download Manual
            </a>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section className="bg-slate-950 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Ready to grow your business?
          </h2>
          <p className="mt-5 text-lg text-slate-400">
            Join lawn care professionals who run their entire operation inside
            YardPilot. Start your free trial today — no credit card required.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/start-trial"
              className="inline-flex min-w-[190px] items-center justify-center rounded-2xl bg-emerald-500 px-7 py-4 text-base font-semibold text-white shadow-[0_20px_50px_rgba(16,185,129,0.22)] transition hover:bg-emerald-400"
            >
              Start free trial
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-[190px] items-center justify-center rounded-2xl border-2 border-white bg-white px-7 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-6 pb-10 pt-4 lg:px-8">
        <div className="mx-auto max-w-7xl border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/YardPilot-logo.png"
                alt="YardPilot"
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
              <a href="/YardPilot-User-Manual.docx" download className="hover:text-white">User Manual</a>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/login" className="hover:text-white">Log in</Link>
            </div>
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} YardPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
