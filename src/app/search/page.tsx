"use client";

import { ProductGrid } from "@/components/product-card";
import { useLiveCatalog, useShopStore } from "@/store/shop-store";
import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

function SearchInner() {
  const { products } = useLiveCatalog();
  const logSearch = useShopStore((s) => s.logSearch);
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const list = useMemo(() => {
    const visible = products.filter((p) => p.searchable !== false);
    if (!q) return visible;
    return visible.filter((p) =>
      [p.name, p.shortDescription, p.category, p.collection, p.metal, p.stone, ...p.tags].join(" ").toLowerCase().includes(q),
    );
  }, [q, products]);

  useEffect(() => {
    if (q) logSearch(q, list.length);
  }, [q, list.length, logSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-4xl font-medium tracking-tight">Search</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {q ? `Results for “${q}” · ${list.length} pieces` : "Browse the full atelier."}
      </p>
      <div className="mt-12">
        <ProductGrid products={list} />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
