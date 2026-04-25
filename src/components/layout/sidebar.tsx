"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
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
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon, technicianVisible: true },
  { href: "/customers", label: "Customers", icon: UsersIcon, technicianVisible: false },
  { href: "/leads", label: "Leads", icon: FunnelIcon, technicianVisible: false },
  { href: "/estimates", label: "Estimates", icon: CalculatorIcon, technicianVisible: false },
  { href: "/jobs", label: "Jobs", icon: ClipboardDocumentListIcon, technicianVisible: true },
  { href: "/schedule", label: "Schedule", icon: CalendarDaysIcon, technicianVisible: true },
  { href: "/technicians", label: "Technicians", icon: WrenchScrewdriverIcon, technicianVisible: false },
  { href: "/invoices", label: "Invoices", icon: DocumentTextIcon, technicianVisible: false },
  { href: "/tasks", label: "Tasks", icon: CheckCircleIcon, technicianVisible: false },
  { href: "/reports", label: "Reports", icon: ChartBarIcon, technicianVisible: false },
  { href: "/expenses", label: "Expenses", icon: BanknotesIcon, technicianVisible: false },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon, technicianVisible: false },
];

export function Sidebar({ role }: { role: string | null }) {
  const pathname = usePathname();
  const isTechnician = role === "technician";
  const navItems = isTechnician
    ? allNavItems.filter((item) => item.technicianVisible)
    : allNavItems;

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
  <div className="border-b border-slate-200 px-5 py-4">
  <div className="flex flex-col items-center">
    <Image
      src="/YardPilot-logo.png"
      alt="Yard Pilot logo"
      width={280}
      height={104}
      className="object-contain"
      priority
    />
    <p className="-mt-7 text-[20px] font-extrabold tracking-[0.25em] uppercase text-slate-500">
      CRM
    </p>
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