"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  FunnelIcon,
  CalculatorIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/customers", label: "Customers", icon: UsersIcon },
  { href: "/leads", label: "Leads", icon: FunnelIcon },
  { href: "/estimates", label: "Estimates", icon: CalculatorIcon },
  { href: "/jobs", label: "Jobs", icon: ClipboardDocumentListIcon },
  { href: "/schedule", label: "Schedule", icon: CalendarDaysIcon },
  { href: "/invoices", label: "Invoices", icon: DocumentTextIcon },
  { href: "/tasks", label: "Tasks", icon: CheckCircleIcon },
  { href: "/reports", label: "Reports", icon: ChartBarIcon },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col items-center gap-1">
          <Image
            src="/YardPilot-logo.png"
            alt="YardPilot logo"
            width={256}
            height={96}
            className="object-contain"
            priority
          />
          <p className="text-lg font-extrabold tracking-widest uppercase" style={{ color: "#1a5c2a" }}>CRM</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Navigation
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5 shrink-0 transition-colors",
                    active
                      ? "text-white"
                      : "text-slate-500 group-hover:text-slate-900"
                  )}
                />
                <span
                  className={clsx(
                    "truncate transition-colors",
                    active ? "text-white" : "text-slate-700 group-hover:text-slate-900"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}