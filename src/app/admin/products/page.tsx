"use client";

import { variantStock } from "@/data/catalog";
import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function AdminProducts() {
  const catalog = useShopStore((s) => s.catalog);
  const deleteProduct = useShopStore((s) => s.deleteProduct);
  const upsertProduct = useShopStore((s) => s.upsertProduct);
  const importCatalog = useShopStore((s) => s.importCatalog);
  const resetCatalog = useShopStore((s) => s.resetCatalog);
  const collections = useShopStore((s) => s.collections);
  const coupons = useShopStore((s) => s.coupons);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const list = useMemo(() => {
    return catalog.filter((p) => {
      const matchQ = !q || `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q.toLowerCase());
      const matchS = status === "all" || (p.status ?? "published") === status;
      return matchQ && matchS;
    });
  }, [catalog, q, status]);

  function exportJson() {
    const blob = new Blob([JSON.stringify({ catalog, collections, coupons }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "avyora-catalog.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.catalog)) importCatalog(data);
      } catch {
        alert("Invalid catalogue file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">Draft, publish, archive and export the catalogue.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportJson} className="border border-line px-4 py-2 text-xs uppercase tracking-widest">
            Export JSON
          </button>
          <label className="border border-line px-4 py-2 text-xs uppercase tracking-widest">
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
            />
          </label>
          <button onClick={resetCatalog} className="border border-line px-4 py-2 text-xs uppercase tracking-widest">
            Restore seed
          </button>
          <Link href="/admin/products/new" className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-ivory">
            Add product
          </Link>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or SKU"
          className="border border-line bg-transparent px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-line bg-transparent px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        {selected.length > 0 && (
          <div className="flex gap-2 text-xs uppercase tracking-widest">
            <button onClick={() => selected.forEach((id) => { const p = catalog.find((x) => x.id === id); if (p) upsertProduct({ ...p, status: "published" }); })}>Publish</button>
            <button onClick={() => selected.forEach((id) => { const p = catalog.find((x) => x.id === id); if (p) upsertProduct({ ...p, status: "draft" }); })}>Unpublish</button>
            <button onClick={() => selected.forEach((id) => { const p = catalog.find((x) => x.id === id); if (p) upsertProduct({ ...p, status: "archived" }); })}>Archive</button>
          </div>
        )}
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-widest text-gold-deep">
            <tr>
              <th className="py-3">
                <input
                  type="checkbox"
                  checked={list.length > 0 && list.every((p) => selected.includes(p.id))}
                  onChange={(e) => setSelected(e.target.checked ? list.map((p) => p.id) : [])}
                />
              </th>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Stock</th>
              <th>From</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((id) => id !== p.id))}
                  />
                </td>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td className="capitalize">{p.status ?? "published"}</td>
                <td>{variantStock(p)}</td>
                <td>{formatINR(Math.min(...p.variants.map((v) => v.salePrice ?? v.price)))}</td>
                <td className="space-x-3 text-xs uppercase tracking-widest">
                  <Link href={`/admin/products/${p.id}`}>Edit</Link>
                  <button onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
