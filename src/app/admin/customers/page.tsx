"use client";

import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import Link from "next/link";

export default function AdminCustomers() {
  const customers = useShopStore((s) => s.customers);
  const orders = useShopStore((s) => s.orders);

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Customers</h1>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-soft">Accounts created at login or guest checkout.</p>
        <button
          onClick={() => {
            const header = "name,email,phone,status,group\n";
            const rows = customers.map((c) => `${c.name},${c.email},${c.phone ?? ""},${c.status},${c.groupId ?? ""}`).join("\n");
            const blob = new Blob([header + rows], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "avyora-customers.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="border border-line px-4 py-2 text-xs uppercase tracking-widest"
        >
          Export CSV
        </button>
      </div>
      <div className="mt-8 divide-y divide-[var(--line)] border border-line">
        {customers.map((c) => {
          const spent = orders
            .filter((o) => o.customerEmail?.toLowerCase() === c.email.toLowerCase() || o.address.name === c.name)
            .reduce((s, o) => s + (o.status === "Refunded" ? 0 : o.total), 0);
          return (
            <Link key={c.id} href={`/admin/customers/${encodeURIComponent(c.id)}`} className="flex justify-between px-4 py-4 text-sm">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-ink-soft">
                  {c.email} · {c.status}
                </p>
              </div>
              <p>{formatINR(spent)}</p>
            </Link>
          );
        })}
        {!customers.length && <p className="px-4 py-8 text-sm text-ink-soft">No customers yet.</p>}
      </div>
    </div>
  );
}
