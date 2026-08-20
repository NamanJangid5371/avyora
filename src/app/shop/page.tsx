"use client";

import { ProductGrid } from "@/components/product-card";
import { categories, variantStock } from "@/data/catalog";
import type { Metal } from "@/data/types";
import { formatINR } from "@/lib/format";
import { useLiveCatalog } from "@/store/shop-store";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ShopInner() {
  const { products, collections } = useLiveCatalog();
  const params = useSearchParams();
  const initialTag = params.get("tag") ?? "";
  const initialSort = params.get("sort") ?? "featured";
  const [category, setCategory] = useState<string>(params.get("category") ?? "All");
  const [metal, setMetal] = useState<string>("All");
  const [sort, setSort] = useState(initialSort);
  const [maxPrice, setMaxPrice] = useState(350000);
  const [inStock, setInStock] = useState(false);

  const list = useMemo(() => {
    let next = [...products];
    if (category !== "All") next = next.filter((p) => p.category === category);
    if (metal !== "All") next = next.filter((p) => p.metal === metal);
    if (initialTag) next = next.filter((p) => p.tags.includes(initialTag));
    next = next.filter((p) => {
      const price = Math.min(...p.variants.map((v) => v.salePrice ?? v.price));
      return price <= maxPrice;
    });
    if (inStock) next = next.filter((p) => variantStock(p) > 0);
    if (sort === "new") next = next.filter((p) => p.newArrival).concat(next.filter((p) => !p.newArrival));
    if (sort === "price-asc")
      next.sort(
        (a, b) =>
          Math.min(...a.variants.map((v) => v.salePrice ?? v.price)) -
          Math.min(...b.variants.map((v) => v.salePrice ?? v.price)),
      );
    if (sort === "price-desc")
      next.sort(
        (a, b) =>
          Math.min(...b.variants.map((v) => v.salePrice ?? v.price)) -
          Math.min(...a.variants.map((v) => v.salePrice ?? v.price)),
      );
    if (sort === "best") next.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || b.rating - a.rating);
    return next;
  }, [category, metal, sort, maxPrice, inStock, initialTag, products]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <p className="section-kicker">Catalogue</p>
      <h1 className="section-title">The jewellery</h1>
      <p className="prose-calm mt-4">
        Filter by metal, category and price. Every piece is hallmarked or certified as listed on the product page.
      </p>

      <div className="mt-12 flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`border px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition ${
              category === c
                ? "border-gold-deep bg-ivory text-ink shadow-[inset_0_-1px_0_var(--gold)]"
                : "border-line text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit space-y-8 border border-line bg-ivory/60 p-6 text-sm lg:sticky lg:top-28">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold-deep">Metal</p>
            <div className="mt-4 flex flex-col gap-2.5">
              {["All", "Gold", "Silver", "Platinum"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMetal(m as Metal | "All")}
                  className={`text-left transition ${metal === m ? "text-ink" : "text-ink-soft hover:text-ink"}`}
                >
                  <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${metal === m ? "bg-gold-deep" : "bg-line"}`} />
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="gold-line" />
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold-deep">Price up to</p>
            <input
              type="range"
              min={5000}
              max={350000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-4 w-full accent-[var(--gold-deep)]"
            />
            <p className="mt-2 font-serif text-xl text-ink">{formatINR(maxPrice)}</p>
          </div>
          <label className="flex items-center gap-2 text-ink-soft">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-[var(--gold-deep)]" />
            In stock only
          </label>
          <div className="gold-line" />
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold-deep">Collections</p>
            <div className="mt-4 flex flex-col gap-2">
              {collections.map((c) => (
                <a key={c.slug} href={`/collections/${c.slug}`} className="text-ink-soft transition hover:text-ink">
                  {c.name}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <p className="font-serif text-2xl tracking-tight">
              Showing <span className="text-gold-deep">{list.length}</span> pieces
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-line bg-transparent px-3 py-2 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="new">New arrivals</option>
              <option value="best">Bestsellers</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
          <ProductGrid products={list} />
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopInner />
    </Suspense>
  );
}
