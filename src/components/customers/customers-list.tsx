"use client";

import Link from "next/link";
import { useState } from "react";

export function CustomersList({ customers }) {
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    const text = `${customer.name} ${customer.email ?? ""} ${customer.phone ?? ""} ${customer.address ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">Customer List</h2>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />

      {!filteredCustomers.length ? (
        <p className="text-sm text-slate-500">No customers found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredCustomers.map((customer) => (
            <li
              key={customer.id}
              className="rounded-lg border border-slate-200 p-3"
            >
              <Link
                href={`/customers/${customer.id}`}
                className="font-medium text-slate-900 underline"
              >
                {customer.name}
              </Link>

              <p className="text-sm text-slate-500">
                {customer.email || "No email"} •{" "}
                {customer.phone || "No phone"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {customer.address || "No address"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}