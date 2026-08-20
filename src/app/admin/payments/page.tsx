"use client";

import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function PaymentsAdmin() {
  const orders = useShopStore((s) => s.orders);
  const ops = useShopStore((s) => s.ops);
  const setOps = useShopStore((s) => s.setOps);
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      orders.filter((o) =>
        `${o.id} ${o.paymentId} ${o.address.name} ${o.customerEmail}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [orders, q],
  );

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Payments</h1>
      <p className="mt-1 text-sm text-ink-soft">Transaction visibility for every order. Methods are configured below.</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order or payment id" className="mt-6 w-full max-w-md border border-line bg-transparent px-3 py-2 text-sm" />
      <div className="mt-6 divide-y divide-[var(--line)] border border-line">
        {list.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {o.id} · {o.paymentMethod ?? "Razorpay"} · {o.paymentStatus ?? "Success"}
            </span>
            <span>{formatINR(o.total)}</span>
          </Link>
        ))}
        {!list.length && <p className="px-4 py-6 text-sm text-ink-soft">No payments yet.</p>}
      </div>
      <h2 className="mt-10 text-lg font-medium">Payment methods</h2>
      <div className="mt-4 space-y-3">
        {ops.paymentMethods.map((m) => (
          <div key={m.id} className="flex items-center justify-between border border-line p-4">
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-sm text-ink-soft">{m.details}</p>
            </div>
            <button
              className="text-xs uppercase tracking-widest"
              onClick={() =>
                setOps({
                  ...ops,
                  paymentMethods: ops.paymentMethods.map((x) => (x.id === m.id ? { ...x, enabled: !x.enabled } : x)),
                })
              }
            >
              {m.enabled ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
