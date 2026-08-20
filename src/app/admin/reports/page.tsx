"use client";

import { variantStock } from "@/data/catalog";
import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import { useMemo, useState } from "react";

function download(name: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsAdmin() {
  const catalog = useShopStore((s) => s.catalog);
  const orders = useShopStore((s) => s.orders);
  const customers = useShopStore((s) => s.customers);
  const coupons = useShopStore((s) => s.coupons);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const d = o.createdAt.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [orders, from, to]);

  const revenue = filtered.filter((o) => o.status !== "Refunded" && o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const refunds = filtered.filter((o) => o.status === "Refunded").reduce((s, o) => s + (o.refundedAmount ?? o.total), 0);

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Reports & analytics</h1>
      <p className="mt-1 text-sm text-ink-soft">Date-filtered sales, orders, inventory, coupons and refunds. Export CSV for the business.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-line bg-transparent px-3 py-2 text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-line bg-transparent px-3 py-2 text-sm" />
        <button
          className="border border-line px-4 py-2 text-xs uppercase tracking-widest"
          onClick={() =>
            download("avyora-orders.csv", [
              ["id", "date", "status", "payment", "total"],
              ...filtered.map((o) => [o.id, o.createdAt, o.status, o.paymentStatus ?? "", String(o.total)]),
            ])
          }
        >
          Export orders CSV
        </button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Revenue", formatINR(revenue)],
          ["Orders", String(filtered.length)],
          ["Refunds", formatINR(refunds)],
          ["Customers", String(customers.length)],
        ].map(([k, v]) => (
          <div key={k} className="border border-line p-4">
            <p className="text-[11px] uppercase tracking-widest text-gold-deep">{k}</p>
            <p className="mt-2 text-2xl font-medium">{v}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-lg font-medium">Inventory</h2>
      <p className="text-sm text-ink-soft">
        {catalog.filter((p) => variantStock(p) === 0).length} out of stock · {catalog.filter((p) => variantStock(p) <= 3).length} low stock
      </p>
      <h2 className="mt-8 text-lg font-medium">Coupon usage</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {coupons.map((c) => (
          <li key={c.code}>
            {c.code}: {c.usageCount ?? 0} uses
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-lg font-medium">Category mix</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {Object.entries(
          catalog.reduce<Record<string, number>>((acc, p) => {
            acc[p.category] = (acc[p.category] ?? 0) + 1;
            return acc;
          }, {}),
        ).map(([k, v]) => (
          <li key={k}>
            {k}: {v} SKUs
          </li>
        ))}
      </ul>
    </div>
  );
}
