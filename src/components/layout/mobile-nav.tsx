"use client";

import { useState } from "react";
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
  BanknotesIcon,
  RectangleStackIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const allNavItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: HomeIcon,                  technicianVisible: true  },
  { href: "/customers",     label: "Customers",     icon: UsersIcon,                 technicianVisible: false },
  { href: "/leads",         label: "Leads",         icon: FunnelIcon,                technicianVisible: false },
  { href: "/estimates",     label: "Estimates",     icon: CalculatorIcon,            technicianVisible: false },
  { href: "/jobs",          label: "Jobs",          icon: ClipboardDocumentListIcon, technicianVisible: true  },
  { href: "/job-templates", label: "Job Templates", icon: RectangleStackIcon,        technicianVisible: false },
  { href: "/schedule",      label: "Schedule",      icon: CalendarDaysIcon,          technicianVisible: true  },
  { href: "/technicians",   label: "Technicians",   icon: WrenchScrewdriverIcon,     technicianVisible: false },
  { href: "/invoices",      label: "Invoices",      icon: DocumentTextIcon,          technicianVisible: false },
  { href: "/tasks",         label: "Tasks",         icon: CheckCircleIcon,           technicianVisible: false },
  { href: "/reports",       label: "Reports",       icon: ChartBarIcon,              technicianVisible: false },
  { href: "/expenses",      label: "Expenses",      icon: BanknotesIcon,             technicianVisible: false },
  { href: "/settings",      label: "Settings",      icon: Cog6ToothIcon,             technicianVisible: false },
];

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
      aria-label="Open menu"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
}

export function MobileNav({ role }: { role?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isTechnician = role === "technician";
  const navItems = isTechnician
    ? allNavItems.filter((item) => item.technicianVisible)
    : allNavItems;

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
        aria-label="Open menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden",
          open ? "flex translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col items-center gap-1">
            <Image
              src="/YardPilot-logo.png"
              alt="YardPilot logo"
              width={180}
              height={68}
              className="object-contain"
              priority
            />
            <p className="text-base font-extrabold tracking-widest uppercase" style={{ color: "#1a5c2a" }}>
              CRM
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Navigation
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-5 w-5 shrink-0",
                      active ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
