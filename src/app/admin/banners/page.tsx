"use client";

import type { Banner } from "@/data/admin-ops";
import { MEDIA_LIBRARY } from "@/lib/media";
import { useShopStore } from "@/store/shop-store";
import { FormEvent, useState } from "react";

export default function BannersAdmin() {
  const ops = useShopStore((s) => s.ops);
  const setOps = useShopStore((s) => s.setOps);
  const [form, setForm] = useState<Banner>({
    id: `ban-${Date.now()}`,
    title: "",
    description: "",
    image: MEDIA_LIBRARY[6],
    href: "/shop",
    cta: "Shop",
    placement: "hero",
    device: "all",
    enabled: true,
    order: 1,
  });

  function save(e: FormEvent) {
    e.preventDefault();
    const exists = ops.banners.some((b) => b.id === form.id);
    setOps({ ...ops, banners: exists ? ops.banners.map((b) => (b.id === form.id ? form : b)) : [...ops.banners, form] });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">Banners</h1>
        <p className="mt-1 text-sm text-ink-soft">Hero, promo and strip banners with schedule, device and links.</p>
        <form onSubmit={save} className="mt-6 space-y-3">
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-20 w-full border border-line bg-transparent px-3 py-2" />
          <input placeholder="Link" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
          <input placeholder="Button label" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
          <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as Banner["placement"] })} className="w-full border border-line bg-transparent px-3 py-2">
            <option value="hero">Hero</option>
            <option value="promo">Promo block</option>
            <option value="strip">Strip</option>
          </select>
          <select value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value as Banner["device"] })} className="w-full border border-line bg-transparent px-3 py-2">
            <option value="all">All devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>
          <input type="date" value={form.startsAt ?? ""} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
          <input type="date" value={form.endsAt ?? ""} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
          <select value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2">
            {MEDIA_LIBRARY.map((src) => (
              <option key={src}>{src}</option>
            ))}
          </select>
          <button className="bg-ink px-5 py-2 text-xs uppercase tracking-widest text-ivory">Save banner</button>
        </form>
      </div>
      <div className="space-y-3">
        {ops.banners.sort((a, b) => a.order - b.order).map((b) => (
          <div key={b.id} className="border border-line p-4">
            <p className="font-medium">{b.title}</p>
            <p className="text-sm text-ink-soft">{b.placement} · {b.enabled ? "live" : "off"} · {b.device}</p>
            <div className="mt-2 space-x-3 text-xs uppercase tracking-widest">
              <button onClick={() => setForm(b)}>Edit</button>
              <button onClick={() => setOps({ ...ops, banners: ops.banners.map((x) => (x.id === b.id ? { ...x, enabled: !x.enabled } : x)) })}>
                Toggle
              </button>
              <button onClick={() => setOps({ ...ops, banners: ops.banners.filter((x) => x.id !== b.id) })}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
