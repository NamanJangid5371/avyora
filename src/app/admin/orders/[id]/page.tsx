"use client";

import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import type { Order } from "@/store/shop-types";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = useShopStore((s) => s.orders.find((o) => o.id === id));
  const updateOrderStatus = useShopStore((s) => s.updateOrderStatus);
  const updateOrder = useShopStore((s) => s.updateOrder);
  const refundOrder = useShopStore((s) => s.refundOrder);
  const cancelOrder = useShopStore((s) => s.cancelOrder);

  if (!order) {
    return (
      <div>
        Order not found.{" "}
        <Link href="/admin/orders" className="underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-gold-deep">Order</p>
      <h1 className="mt-1 text-3xl font-medium tracking-tight">{order.id}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Payment {order.paymentId} · {order.paymentMethod ?? "Razorpay"} · {order.paymentStatus ?? "Success"} · {order.customerEmail ?? "guest"}
      </p>
      <div className="mt-8 space-y-3 text-sm">
        {order.items.map((item) => (
          <div key={item.sku} className="flex justify-between border-b border-line pb-3">
            <span>
              {item.name} · {item.sku} ×{item.quantity}
            </span>
            <span>{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}
        <p className="flex justify-between">
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </p>
        {order.refundedAmount ? (
          <p className="text-ink-soft">Refunded {formatINR(order.refundedAmount)}</p>
        ) : null}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Fulfilment status
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2"
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Tracking ID
          <input
            value={order.trackingId ?? ""}
            onChange={(e) => updateOrder(order.id, { trackingId: e.target.value })}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm">
        Internal notes
        <textarea
          value={order.notes ?? ""}
          onChange={(e) => updateOrder(order.id, { notes: e.target.value })}
          className="mt-1 min-h-24 w-full border border-line bg-transparent px-3 py-2"
        />
      </label>
      <p className="mt-6 text-sm">
        Ship to {order.address.name}, {order.address.line1}, {order.address.city} {order.address.pincode} · {order.address.phone}
      </p>
      <button
        onClick={() => {
          const lines = [
            `Avyora invoice`,
            `Order ${order.id}`,
            `Date ${new Date(order.createdAt).toLocaleString("en-IN")}`,
            `Payment ${order.paymentId} ${order.paymentStatus ?? ""}`,
            ...order.items.map((i) => `${i.name} ${i.sku} x${i.quantity} ${i.price}`),
            `Total ${order.total}`,
            `Ship to ${order.address.name}, ${order.address.line1}, ${order.address.city} ${order.address.pincode}`,
          ];
          const blob = new Blob([lines.join("\n")], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${order.id}-invoice.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="mt-4 text-xs uppercase tracking-widest underline"
      >
        Download invoice
      </button>
      {order.status !== "Refunded" && order.status !== "Cancelled" && (
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => refundOrder(order.id)} className="border border-ink px-5 py-2 text-xs uppercase tracking-widest">
            Issue full refund
          </button>
          <button
            onClick={() => cancelOrder(order.id, "Cancelled by admin")}
            className="border border-line px-5 py-2 text-xs uppercase tracking-widest"
          >
            Cancel order
          </button>
        </div>
      )}
    </div>
  );
}
