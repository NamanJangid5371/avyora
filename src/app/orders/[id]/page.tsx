"use client";

import { formatINR } from "@/lib/format";
import { downloadOrderInvoicePdf, ORDER_FLOW, orderStatusStep } from "@/lib/invoice-pdf";
import { useShopStore } from "@/store/shop-store";
import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const order = useShopStore((s) => s.orders.find((o) => o.id === id));
  const user = useShopStore((s) => s.user);
  const requestReturn = useShopStore((s) => s.requestReturn);
  const step = order ? orderStatusStep(order.status) : -1;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-4xl tracking-tight">Order not found</h1>
        <Link href="/account" className="btn-primary mt-8 inline-flex">
          Back to account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="section-kicker">Order</p>
      <h1 className="section-title">{order.id}</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Placed {new Date(order.createdAt).toLocaleString("en-IN")} · Payment {order.paymentId}
        {order.trackingId ? ` · Tracking ${order.trackingId}` : ""}
      </p>

      <div className="mt-8 border border-line bg-ivory/70 p-5">
        <p className="text-[11px] tracking-[0.18em] uppercase text-gold-deep">Current status</p>
        <p className="mt-2 font-serif text-3xl">{order.status}</p>
        {step >= 0 && (
          <div className="mt-5 flex flex-wrap gap-1">
            {ORDER_FLOW.map((s, i) => (
              <span
                key={s}
                className={`px-2.5 py-1.5 text-[10px] tracking-[0.12em] uppercase ${
                  i <= step ? "bg-ink text-ivory" : "border border-line text-ink-soft"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {order.paymentStatus && (
          <p className="mt-4 text-sm text-ink-soft">Payment status: {order.paymentStatus}</p>
        )}
      </div>

      <div className="mt-10 space-y-4">
        {order.items.map((item) => (
          <div key={item.sku} className="flex gap-4 border-b border-line pb-4">
            <div className="relative h-20 w-16 overflow-hidden bg-ivory ring-1 ring-[rgba(138,109,69,0.18)]">
              <ProductImage src={item.image} alt={item.name} fill />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium">{item.name}</p>
              <p className="text-sm text-ink-soft">
                {item.sku} · ×{item.quantity}
              </p>
            </div>
            <p>{formatINR(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-2 border border-line bg-paper/50 p-5 text-sm">
        <p className="flex justify-between">
          <span className="text-ink-soft">Subtotal</span>
          <span>{formatINR(order.subtotal)}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-ink-soft">Discount</span>
          <span>{formatINR(order.discount)}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-ink-soft">Shipping</span>
          <span>{order.shipping ? formatINR(order.shipping) : "Complimentary"}</span>
        </p>
        <p className="flex justify-between border-t border-line pt-3 text-base font-medium">
          <span>Total paid</span>
          <span>{formatINR(order.total)}</span>
        </p>
        <p className="pt-2 text-ink-soft">
          Ship to {order.address.name}, {order.address.line1}, {order.address.city} {order.address.pincode} ·{" "}
          {order.address.phone}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => downloadOrderInvoicePdf(order, user?.name)}
          className="btn-primary"
        >
          Download invoice PDF
        </button>
        <Link href="/account" className="border border-line px-5 py-3 text-[11px] tracking-[0.2em] uppercase transition hover:border-ink">
          Back to account
        </Link>
      </div>

      {order.status === "Delivered" && (
        <button onClick={() => requestReturn(order.id)} className="mt-6 text-[11px] tracking-widest uppercase underline">
          Request return
        </button>
      )}
      <Link href="/shop" className="mt-10 block text-[11px] tracking-[0.2em] uppercase text-ink-soft transition hover:text-ink">
        Continue shopping
      </Link>
    </div>
  );
}
