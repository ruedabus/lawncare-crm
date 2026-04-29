import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | YardPilot",
  description:
    "YardPilot was built by a small team that believes lawn care professionals deserve software as hardworking as they are. Learn our story.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/YardPilot-logo.png" alt="YardPilot" className="h-28 w-auto sm:h-36" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
            >
              Home
            </Link>
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

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-4rem] top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute right-[-6rem] top-0 h-80 w-80 rounded-full bg-slate-200/40 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Our story
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Built for the pros who<br />
            <span className="text-emerald-600">do the real work</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            YardPilot started with a simple observation: lawn care professionals are running full businesses
            from their phones and trucks, but the software available to them was either too expensive,
            too complicated, or built for someone else entirely.
          </p>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Our mission
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Give every lawn care business the tools to compete and grow
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Running a lawn care business is hard. You're up before sunrise, working through heat and rain,
              juggling customers, crew, equipment, and cash flow — all at the same time. The last thing you
              need is software that fights you.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              YardPilot is built to work the way you work. It's fast to set up, easy to use in the field,
              and handles the back-office stuff — invoices, leads, reminders, scheduling — so you can stay
              focused on the job in front of you.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(15,23,42,0.12)] ring-4 ring-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-worker.png"
              alt="Lawn care professional at work"
              className="h-[380px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              What we believe
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              A few things we care about deeply
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Your time is valuable",
                desc:
                  "Every feature we build has to save time — not add steps. If a task takes three clicks somewhere else, we want it to take one in YardPilot.",
              },
              {
                icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
                title: "Honest pricing",
                desc:
                  "No surprise fees. No locked features hiding behind a sales call. You see the price, you know what you get, and you can cancel anytime.",
              },
              {
                icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-6 3h.008v.008H6V15z",
                title: "Built for mobile",
                desc:
                  "You're not behind a desk. YardPilot is designed for the field — fast on a phone, no app install required, works everywhere your crew does.",
              },
              {
                icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
                title: "Made for all crews",
                desc:
                  "Whether you're solo or running a team of ten, YardPilot scales with you. Same clean interface, same easy access — just more horsepower when you need it.",
              },
              {
                icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
                title: "Security you can trust",
                desc:
                  "Payments run through Stripe. Customer data stays yours. We use industry-standard security so your business information is protected.",
              },
              {
                icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
                title: "Real support",
                desc:
                  "When you have a question, a real person answers. We're a small team and we take every customer seriously — because your success is ours.",
              },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{v.title}</h3>
                <p className="text-sm leading-7 text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            How it started
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            A business built from the ground up
          </h2>
        </div>
        <div className="prose prose-slate mx-auto max-w-none text-base leading-8 text-slate-600">
          <p>
            YardPilot was born out of frustration. Too many good lawn care operators were losing money —
            not because they lacked skill, but because they were using notebooks, text threads, and
            spreadsheets to run a real business. They were showing up to jobs with no paperwork,
            chasing down unpaid invoices weeks later, and missing follow-ups with leads who were
            ready to buy.
          </p>
          <p className="mt-5">
            We set out to build something different — software that was genuinely useful in the field,
            not just impressive in a demo. That means it works on your phone in the sun. It takes
            seconds to send an invoice. It captures leads while you're driving. It reminds customers
            to pay so you don't have to.
          </p>
          <p className="mt-5">
            We're a small, independent team and we're proud of that. Every update comes from real
            feedback from real lawn care operators. We don't have a committee or a product roadmap
            locked six quarters out. If our customers need something, we build it.
          </p>
          <p className="mt-5">
            YardPilot is growing — one crew at a time. If you run a lawn care business and you want
            to run it better, we'd love to have you on board.
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="bg-emerald-600 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to simplify your operation?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100">
            Start a free 14-day trial and see why lawn care crews across the country trust YardPilot
            to keep their business running.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/start-trial"
              className="inline-flex min-w-[190px] items-center justify-center rounded-2xl bg-white px-7 py-4 text-base font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
            >
              Start free trial
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-[190px] items-center justify-center rounded-2xl border border-emerald-400 px-7 py-4 text-base font-semibold text-white transition hover:bg-emerald-500"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-6 pb-10 pt-4 lg:px-8">
        <div className="mx-auto max-w-7xl border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/YardPilot-logo.png" alt="YardPilot" className="h-12 w-auto brightness-0 invert" />
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <a href="/#features" className="hover:text-white">Features</a>
              <a href="/#pricing" className="hover:text-white">Pricing</a>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/login" className="hover:text-white">Log in</Link>
            </div>
            <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} YardPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
