"use client";

import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import type { Order } from "@/store/shop-types";
import Link from "next/link";
import { useMemo, useState } from "react";

const statuses: Order["status"][] = [
  "Pending Payment",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Refunded",
];

export default function AdminOrders() {
  const orders = useShopStore((s) => s.orders);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    for (const s of statuses) map[s] = 0;
    for (const o of orders) map[o.status] = (map[o.status] ?? 0) + 1;
    return map;
  }, [orders]);

  const list = useMemo(() => {
    return orders
      .filter((o) => {
        const matchF = filter === "all" || o.status === filter;
        const matchQ =
          !q ||
          `${o.id} ${o.address.name} ${o.address.phone} ${o.customerEmail} ${o.trackingId} ${o.items.map((i) => i.name).join(" ")}`
            .toLowerCase()
            .includes(q.toLowerCase());
        return matchF && matchQ;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, filter, q]);

  const revenue = useMemo(
    () => list.reduce((sum, o) => sum + (o.status === "Cancelled" || o.status === "Refunded" ? 0 : o.total), 0),
    [list],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Fulfilment, payment status, tracking, and customer delivery details.
          </p>
        </div>
        <p className="text-sm text-ink-soft">
          {list.length} shown · {formatINR(revenue)} in view
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`border px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase ${
            filter === "all" ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft hover:border-ink"
          }`}
        >
          All ({counts.all})
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`border px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase ${
              filter === s ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft hover:border-ink"
            }`}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search number, customer, phone, email, tracking, product"
          className="min-w-64 flex-1 border border-line bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-6 overflow-hidden border border-line">
        <div className="hidden grid-cols-[1.1fr_1.2fr_0.9fr_0.8fr_0.7fr] gap-3 border-b border-line bg-ivory/80 px-4 py-3 text-[10px] tracking-[0.16em] uppercase text-ink-soft md:grid">
          <span>Order</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Payment</span>
          <span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {list.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="grid gap-2 px-4 py-4 text-sm transition hover:bg-ivory/60 md:grid-cols-[1.1fr_1.2fr_0.9fr_0.8fr_0.7fr] md:items-center md:gap-3"
            >
              <div>
                <p className="font-medium">{o.id}</p>
                <p className="text-xs text-ink-soft">{new Date(o.createdAt).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p>{o.address.name}</p>
                <p className="text-xs text-ink-soft">
                  {o.customerEmail ?? "Guest"} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div>
                <p>{o.status}</p>
                {o.trackingId && <p className="text-xs text-ink-soft">Track {o.trackingId}</p>}
              </div>
              <div className="text-ink-soft">
                {o.paymentStatus ?? "Success"}
                <span className="mt-0.5 block text-xs">{o.paymentMethod ?? "Razorpay"}</span>
              </div>
              <p className="font-medium md:text-right">{formatINR(o.total)}</p>
            </Link>
          ))}
          {!list.length && <p className="px-4 py-10 text-sm text-ink-soft">No orders in this view.</p>}
        </div>
      </div>
    </div>
  );
}
