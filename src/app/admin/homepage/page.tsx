"use client";

import { useShopStore } from "@/store/shop-store";

export default function HomepageAdmin() {
  const ops = useShopStore((s) => s.ops);
  const setOps = useShopStore((s) => s.setOps);
  const sections = [...ops.homepageSections].sort((a, b) => a.order - b.order);

  function move(id: string, dir: -1 | 1) {
    const i = sections.findIndex((s) => s.id === id);
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const copy = [...sections];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setOps({ ...ops, homepageSections: copy.map((s, idx) => ({ ...s, order: idx + 1 })) });
  }

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Homepage</h1>
      <p className="mt-1 text-sm text-ink-soft">Enable, disable and reorder storefront sections. Banner copy is managed under Banners.</p>
      <div className="mt-8 space-y-3">
        {sections.map((s) => (
          <div key={s.id} className="flex items-center justify-between border border-line p-4">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-ink-soft">Order {s.order} · {s.enabled ? "visible" : "hidden"}</p>
            </div>
            <div className="space-x-3 text-xs uppercase tracking-widest">
              <button onClick={() => move(s.id, -1)}>Up</button>
              <button onClick={() => move(s.id, 1)}>Down</button>
              <button
                onClick={() =>
                  setOps({
                    ...ops,
                    homepageSections: ops.homepageSections.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)),
                  })
                }
              >
                {s.enabled ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
