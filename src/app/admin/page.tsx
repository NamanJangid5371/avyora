"use client";

import { variantStock } from "@/data/catalog";
import { formatINR } from "@/lib/format";
import { isPublished, useShopStore } from "@/store/shop-store";
import Link from "next/link";

export default function AdminHome() {
  const catalog = useShopStore((s) => s.catalog);
  const orders = useShopStore((s) => s.orders);
  const customers = useShopStore((s) => s.customers);
  const coupons = useShopStore((s) => s.coupons);
  const campaigns = useShopStore((s) => s.campaigns);
  const reviews = catalog.flatMap((p) => p.reviews.map((r) => ({ p, r })));

  const revenue = orders.filter((o) => o.status !== "Refunded" && o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
  const live = catalog.filter(isPublished).length;
  const low = catalog.flatMap((p) =>
    p.variants.filter((v) => v.stock <= (p.minStock ?? 3)).map((v) => ({ name: p.name, sku: v.sku, stock: v.stock })),
  );
  const out = catalog.filter((p) => variantStock(p) === 0);
  const statusCount = (s: string) => orders.filter((o) => o.status === s).length;
  const topProducts = [...catalog]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);
  const catPerf = catalog.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  const kpis = [
    ["Total revenue", formatINR(revenue)],
    ["Today's sales", formatINR(todaySales)],
    ["Today's orders", String(todayOrders.length)],
    ["Customers", String(customers.length)],
    ["Active products", String(live)],
    ["Low / out of stock", `${low.length} / ${out.length}`],
  ];

  const quick = [
    ["/admin/products/new", "Add product"],
    ["/admin/orders", "Process orders"],
    ["/admin/inventory", "Stock alerts"],
    ["/admin/coupons", "New coupon"],
    ["/admin/banners", "Homepage banner"],
    ["/admin/reports", "Reports"],
  ];

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Website dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Day-to-day control of catalogue, orders, content and promotions.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map(([k, v]) => (
          <div key={k} className="border border-line bg-paper p-4">
            <p className="text-[11px] tracking-widest uppercase text-gold-deep">{k}</p>
            <p className="mt-2 text-2xl font-medium">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        {["Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Return Requested", "Refunded"].map((s) => (
          <span key={s} className="border border-line px-3 py-1">
            {s}: {statusCount(s)}
          </span>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {quick.map(([href, label]) => (
          <Link key={href} href={href} className="border border-line px-4 py-2 text-xs uppercase tracking-widest">
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-medium">Recent orders</h2>
          <div className="divide-y divide-[var(--line)] border border-line">
            {orders.slice(0, 8).map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex justify-between px-4 py-3 text-sm">
                <span>
                  {o.id} · {o.status} · {o.paymentStatus ?? "Success"}
                </span>
                <span>{formatINR(o.total)}</span>
              </Link>
            ))}
            {!orders.length && <p className="px-4 py-6 text-sm text-ink-soft">No orders yet.</p>}
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-lg font-medium">Alerts</h2>
          <div className="space-y-3 text-sm">
            <div className="border border-line p-4">
              <p className="text-[11px] uppercase tracking-widest text-gold-deep">Low stock</p>
              {low.slice(0, 4).map((r) => (
                <p key={r.sku} className="mt-1">
                  {r.name} · {r.stock}
                </p>
              ))}
              {!low.length && <p className="mt-1 text-ink-soft">None</p>}
            </div>
            <div className="border border-line p-4">
              <p className="text-[11px] uppercase tracking-widest text-gold-deep">New customers</p>
              {customers.slice(0, 4).map((c) => (
                <p key={c.id} className="mt-1">
                  {c.name}
                </p>
              ))}
              {!customers.length && <p className="mt-1 text-ink-soft">None yet</p>}
            </div>
            <div className="border border-line p-4">
              <p className="text-[11px] uppercase tracking-widest text-gold-deep">Recent reviews</p>
              {reviews.slice(0, 3).map(({ p, r }) => (
                <p key={r.id} className="mt-1">
                  {p.name}: {r.rating}/5
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-medium">Top pieces</h2>
          <ul className="space-y-2 text-sm">
            {topProducts.map((p) => (
              <li key={p.id}>
                {p.name} · {p.category} · {p.reviewCount} reviews
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-medium">Categories & campaigns</h2>
          <p className="text-sm text-ink-soft">
            {Object.entries(catPerf)
              .map(([k, v]) => `${k} (${v})`)
              .join(" · ")}
          </p>
          <p className="mt-3 text-sm">
            {coupons.filter((c) => c.active !== false).length} active coupons · {campaigns.filter((c) => c.active).length} live promotions
          </p>
        </div>
      </div>
    </div>
  );
}
