"use client";

import { useShopStore } from "@/store/shop-store";

export default function SettingsAdmin() {
  const ops = useShopStore((s) => s.ops);
  const setOps = useShopStore((s) => s.setOps);
  if (!ops?.settings) {
    return <p className="text-sm text-ink-soft">Loading settings…</p>;
  }
  const s = ops.settings;

  function patch(partial: Partial<typeof s>) {
    setOps({ ...ops, settings: { ...s, ...partial } });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-medium tracking-tight">Website settings</h1>
      <p className="mt-1 text-sm text-ink-soft">Store identity, tax, shipping threshold, returns and maintenance.</p>
      <div className="mt-8 space-y-3">
        <input value={s.name} onChange={(e) => patch({ name: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
        <input value={s.tagline} onChange={(e) => patch({ tagline: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
        <input value={s.email} onChange={(e) => patch({ email: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
        <input value={s.phone} onChange={(e) => patch({ phone: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
        <input value={s.address} onChange={(e) => patch({ address: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
        <input value={s.hours} onChange={(e) => patch({ hours: e.target.value })} className="w-full border border-line bg-transparent px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Tax %<input type="number" value={s.taxPercent} onChange={(e) => patch({ taxPercent: Number(e.target.value) })} className="mt-1 w-full border border-line bg-transparent px-3 py-2" /></label>
          <label className="text-sm">Free shipping min<input type="number" value={s.freeShippingMin} onChange={(e) => patch({ freeShippingMin: Number(e.target.value) })} className="mt-1 w-full border border-line bg-transparent px-3 py-2" /></label>
          <label className="text-sm">Return days<input type="number" value={s.returnDays} onChange={(e) => patch({ returnDays: Number(e.target.value) })} className="mt-1 w-full border border-line bg-transparent px-3 py-2" /></label>
          <label className="text-sm">Currency<input value={s.currency} onChange={(e) => patch({ currency: e.target.value })} className="mt-1 w-full border border-line bg-transparent px-3 py-2" /></label>
        </div>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" checked={s.maintenance} onChange={(e) => patch({ maintenance: e.target.checked })} />
          Maintenance mode
        </label>
      </div>
    </div>
  );
}
