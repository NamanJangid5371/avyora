"use client";

import { useShopStore } from "@/store/shop-store";
import { useState } from "react";

export default function InventoryPage() {
  const catalog = useShopStore((s) => s.catalog);
  const ops = useShopStore((s) => s.ops);
  const setVariantStock = useShopStore((s) => s.setVariantStock);
  const [reason, setReason] = useState("Manual adjustment");
  const [view, setView] = useState<"all" | "low" | "out">("all");

  const rows = catalog.flatMap((p) =>
    p.variants.map((v) => ({ p, v, min: p.minStock ?? 3 })),
  ).filter(({ v, min }) => {
    if (view === "low") return v.stock > 0 && v.stock <= min;
    if (view === "out") return v.stock === 0;
    return true;
  });

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Inventory & stock</h1>
      <p className="mt-1 text-sm text-ink-soft">Adjust stock with a reason. Low-stock uses each product&apos;s minimum or 3 units.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <input value={reason} onChange={(e) => setReason(e.target.value)} className="border border-line bg-transparent px-3 py-2 text-sm" placeholder="Adjustment reason" />
        <select value={view} onChange={(e) => setView(e.target.value as typeof view)} className="border border-line bg-transparent px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-widest text-gold-deep">
            <tr>
              <th className="py-3">Product</th>
              <th>SKU</th>
              <th>Finish</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, v, min }) => (
              <tr key={v.sku} className="border-t border-line">
                <td className="py-3">{p.name}</td>
                <td>{v.sku}</td>
                <td>
                  {v.size ?? "—"} · {v.colour} {v.purity}
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) => setVariantStock(p.id, v.sku, Number(e.target.value), reason)}
                    className={`w-24 border bg-transparent px-2 py-1 ${v.stock <= min ? "border-red-800" : "border-line"}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-10 text-lg font-medium">Stock movement</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {ops?.stockMoves.slice(0, 20).map((m) => (
          <li key={m.id}>
            {new Date(m.at).toLocaleString("en-IN")} · {m.sku} · {m.delta > 0 ? "+" : ""}
            {m.delta} · {m.reason} · {m.actor}
          </li>
        ))}
        {!ops?.stockMoves.length && <li className="text-ink-soft">No adjustments recorded.</li>}
      </ul>
    </div>
  );
}
