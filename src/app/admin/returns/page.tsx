"use client";

import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import Link from "next/link";

export default function ReturnsAdmin() {
  const orders = useShopStore((s) => s.orders);
  const updateOrder = useShopStore((s) => s.updateOrder);
  const updateOrderStatus = useShopStore((s) => s.updateOrderStatus);
  const refundOrder = useShopStore((s) => s.refundOrder);
  const returns = orders.filter((o) => o.status === "Return Requested" || o.status === "Refunded");

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Returns & refunds</h1>
      <p className="mt-1 text-sm text-ink-soft">Approve or reject returns, record refund amounts, and keep a history.</p>
      <div className="mt-8 space-y-4">
        {returns.map((o) => (
          <div key={o.id} className="border border-line p-4">
            <div className="flex justify-between">
              <Link href={`/admin/orders/${o.id}`} className="font-medium underline">
                {o.id}
              </Link>
              <span className="text-sm">{o.status} · {formatINR(o.refundedAmount ?? 0)} refunded</span>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{o.returnReason || "No reason recorded"}</p>
            {o.status === "Return Requested" && (
              <div className="mt-3 space-x-3 text-xs uppercase tracking-widest">
                <button onClick={() => refundOrder(o.id)}>Approve refund</button>
                <button onClick={() => updateOrderStatus(o.id, "Delivered")}>Reject return</button>
                <button onClick={() => updateOrder(o.id, { returnReason: "QC failed — restock pending" })}>Add reason</button>
              </div>
            )}
          </div>
        ))}
        {!returns.length && <p className="text-sm text-ink-soft">No return or refund records.</p>}
      </div>
    </div>
  );
}
