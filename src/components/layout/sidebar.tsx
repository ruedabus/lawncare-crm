"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  HomeIcon,
  UsersIcon,
  FunnelIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/customers", label: "Customers", icon: UsersIcon },
  { href: "/leads", label: "Leads", icon: FunnelIcon },
  { href: "/jobs", label: "Jobs", icon: CalendarDaysIcon },
  { href: "/invoices", label: "Invoices", icon: DocumentTextIcon },
  { href: "/tasks", label: "Tasks", icon: CheckCircleIcon },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">LawnCare CRM</h1>
        <p className="text-sm text-slate-500">Operator Console</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}