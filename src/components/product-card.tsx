"use client";

import { displayPrice } from "@/data/catalog";
import type { Product } from "@/data/types";
import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import { Heart } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { useToast } from "@/components/toast";
import Link from "next/link";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const wish = useShopStore((s) => s.wishlist.includes(product.id));
  const toggle = useShopStore((s) => s.toggleWishlist);
  const { toast } = useToast();
  const price = displayPrice(product);
  const [pop, setPop] = useState(false);

  function onWish() {
    toggle(product.id);
    setPop(true);
    toast(wish ? "Removed from wishlist" : "Saved to wishlist");
    window.setTimeout(() => setPop(false), 350);
  }

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory shadow-[var(--shadow-soft)] transition duration-500 group-hover:shadow-[var(--shadow-lift)]">
        <div className="pointer-events-none absolute inset-0 z-10 ring-1 ring-inset ring-[rgba(138,109,69,0.22)] transition duration-500 group-hover:ring-[rgba(138,109,69,0.45)]" />
        <Link href={`/product/${product.slug}`}>
          <ProductImage
            key={`${product.id}-${product.images[0]}`}
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-[900ms] ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
        <Link
          href={`/product/${product.slug}`}
          className="pointer-events-none absolute inset-x-6 bottom-6 z-20 translate-y-2 bg-paper/95 py-2.5 text-center text-[10px] tracking-[0.2em] uppercase opacity-0 shadow-[var(--shadow-soft)] transition duration-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
        >
          View piece
        </Link>
        <button
          onClick={onWish}
          className={`absolute right-3 top-3 z-20 rounded-full bg-paper/85 p-2.5 backdrop-blur transition hover:bg-paper ${pop ? "heart-pop" : ""}`}
          aria-label="Wishlist"
        >
          <Heart size={15} fill={wish ? "currentColor" : "none"} className={wish ? "text-ink" : "text-ink-soft"} />
        </button>
        {product.newArrival && (
          <span className="absolute left-3 top-3 z-20 bg-ink/90 px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase text-ivory">
            New
          </span>
        )}
      </div>
      <div className="mt-5 space-y-1.5">
        <p className="font-serif text-[13px] tracking-[0.08em] text-gold-deep">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="block text-[15px] font-medium leading-snug tracking-tight transition hover:text-gold-deep">
          {product.name}
        </Link>
        <p className="text-sm text-ink-soft">
          {formatINR(price.from)}
          {price.onSale && (
            <span className="ml-2 text-xs line-through opacity-55">{formatINR(price.originalFrom)}</span>
          )}
        </p>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <p className="py-20 text-center text-ink-soft">No pieces match these filters.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
