"use client";

import { ProductCard } from "@/components/product-card";
import { deliveryEstimate, formatINR } from "@/lib/format";
import { useLiveCatalog, useShopStore } from "@/store/shop-store";
import { useToast } from "@/components/toast";
import { Heart, Shield, Truck } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products } = useLiveCatalog();
  const product = products.find((p) => p.slug === slug);
  const addToCart = useShopStore((s) => s.addToCart);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const wished = useShopStore((s) => (product ? s.wishlist.includes(product.id) : false));
  const { toast } = useToast();
  const [sku, setSku] = useState(product?.variants[0]?.sku ?? "");
  const [qty, setQty] = useState(1);
  const [image, setImage] = useState(0);
  const [tab, setTab] = useState<"story" | "specs" | "care" | "reviews">("story");
  const [added, setAdded] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (product && !product.variants.some((v) => v.sku === sku)) {
      setSku(product.variants[0]?.sku ?? "");
    }
  }, [product, sku]);

  const variant = useMemo(() => product?.variants.find((v) => v.sku === sku), [product, sku]);

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">This piece is no longer listed</h1>
        <Link href="/shop" className="btn-primary mt-8 inline-flex">
          Return to shop
        </Link>
      </div>
    );
  }

  const price = variant ? variant.salePrice ?? variant.price : 0;
  const relatedBySlug = products.filter((p) => product.relatedSlugs?.includes(p.slug));
  const together = products.filter((p) => product.togetherSlugs?.includes(p.slug));
  const related = (
    relatedBySlug.length
      ? relatedBySlug
      : products.filter(
          (p) => p.slug !== product.slug && (p.collection === product.collection || p.category === product.category),
        )
  ).slice(0, 4);

  function onAdd() {
    addToCart(product!.id, sku, qty);
    setAdded(true);
    toast("Added to bag");
    setTimeout(() => setAdded(false), 1800);
  }

  function onWish() {
    toggleWishlist(product!.id);
    setPop(true);
    toast(wished ? "Removed from wishlist" : "Saved to wishlist");
    setTimeout(() => setPop(false), 350);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-[11px] tracking-[0.18em] uppercase text-ink-soft">
        Shop / {product.category} / {product.name}
      </p>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-ivory shadow-[var(--shadow-soft)] ring-1 ring-[rgba(138,109,69,0.18)]">
            <ProductImage
              key={`${product.id}-${product.images[image]}`}
              src={product.images[image]}
              alt={product.name}
              fill
              className="object-cover transition duration-700 hover:scale-[1.04]"
              priority
              sizes="50vw"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setImage(i)}
                className={`relative aspect-square overflow-hidden transition ${
                  i === image ? "ring-1 ring-gold-deep" : "ring-1 ring-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <ProductImage src={src} alt={`${product.name} view ${i + 1}`} fill />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-28">
          <p className="text-[11px] tracking-[0.22em] uppercase text-gold-deep">{product.collection}</p>
          <div className="gold-rule mt-3" />
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-sm text-ink-soft">
            {product.rating} · {product.reviewCount} reviews · SKU {variant?.sku}
          </p>
          <p className="mt-7 text-3xl font-medium tracking-tight">
            {formatINR(price)}
            {variant?.salePrice && (
              <span className="ml-3 text-xl text-ink-soft line-through">{formatINR(variant.price)}</span>
            )}
          </p>
          <p className="mt-2 text-xs text-ink-soft">{product.taxNote}</p>

          <div className="mt-6 border border-[rgba(138,109,69,0.28)] bg-ivory/80 px-4 py-3 text-sm">
            <p className="flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase text-gold-deep">
              <Shield size={14} /> Atelier certificate
            </p>
            <p className="mt-1 text-ink-soft">
              {product.certifiedBy} · {product.certificateNumber || "Hallmark on request"}
            </p>
          </div>

          <p className="prose-calm mt-6">{product.description}</p>

          {product.variants.some((v) => v.size) && (
            <div className="mt-9">
              <p className="text-[11px] tracking-[0.18em] uppercase">Size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.sku}
                    onClick={() => setSku(v.sku)}
                    className={`min-w-12 border px-3 py-2 text-sm transition ${
                      sku === v.sku ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink"
                    }`}
                  >
                    {v.size ?? v.colour}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants.some((v) => !v.size) && product.variants.length > 1 && (
            <div className="mt-9">
              <p className="text-[11px] tracking-[0.18em] uppercase">Finish</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.sku}
                    onClick={() => setSku(v.sku)}
                    className={`border px-3 py-2 text-sm transition ${
                      sku === v.sku ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink"
                    }`}
                  >
                    {v.colour} {v.purity} {v.metal}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-9 flex items-center gap-3">
            <div className="flex border border-line">
              <button className="px-3 py-3 transition hover:bg-ivory" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="px-4 py-3">{qty}</span>
              <button className="px-3 py-3 transition hover:bg-ivory" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
            <button onClick={onAdd} disabled={!variant || variant.stock < 1} className="btn-primary flex-1 py-3.5">
              {variant && variant.stock < 1 ? "Waitlist" : added ? "Added to bag" : "Add to bag"}
            </button>
            <button
              onClick={onWish}
              className={`border border-line p-3.5 transition hover:border-ink ${pop ? "heart-pop" : ""}`}
              aria-label="Wishlist"
            >
              <Heart size={18} fill={wished ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            {variant?.stock ?? 0} in atelier · Estimated delivery {deliveryEstimate()}
          </p>
          <div className="mt-8 grid gap-4 border-t border-line pt-8 text-sm text-ink-soft">
            <p className="flex items-center gap-3">
              <Shield size={16} className="text-gold-deep" /> {product.certifiedBy} · {product.certificateNumber}
            </p>
            <p className="flex items-center gap-3">
              <Truck size={16} className="text-gold-deep" /> Insured shipping · {product.warranty}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20 border-t border-line pt-12">
        <div className="flex flex-wrap gap-8 text-[11px] tracking-[0.2em] uppercase">
          {(["story", "specs", "care", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 transition ${
                tab === t ? "border-b border-gold-deep text-ink" : "border-b border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-8 max-w-3xl text-sm leading-8 text-ink-soft">
          {tab === "story" && <p className="text-ink">{product.story}</p>}
          {tab === "specs" && (
            <dl className="grid grid-cols-2 gap-5">
              {[
                ["Metal", `${product.purity} ${product.colour} ${product.metal}`],
                ["Stone", product.stone ?? "—"],
                ["Cut", product.cut ?? "—"],
                ["Clarity", product.clarity ?? "—"],
                ["Carat", product.carat ?? "—"],
                ["Weight", product.weight],
                ["Dimensions", product.dimensions],
                ["Making", formatINR(product.makingCharge)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] tracking-[0.16em] uppercase text-gold-deep">{k}</dt>
                  <dd className="mt-1 text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "care" && (
            <div className="space-y-4 text-ink">
              <p>{product.care}</p>
              <p>{product.returnPolicy}</p>
            </div>
          )}
          {tab === "reviews" && (
            <div className="space-y-6">
              {product.reviews.map((r) => (
                <div key={r.id} className="border-b border-line pb-6">
                  <p className="font-medium text-ink">
                    {r.title} · {r.rating}/5
                  </p>
                  <p className="text-xs">
                    {r.author} {r.verified && "· Verified"} · {r.date}
                  </p>
                  <p className="mt-2 text-ink">{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-20 h-[62vh] overflow-hidden">
        <ProductImage src={product.lifestyleImage ?? product.images[0]} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/30 to-transparent" />
      </div>

      {together.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mt-0">Frequently bought together</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {together.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-24 pb-8">
        <h2 className="section-title mt-0">You may also like</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
