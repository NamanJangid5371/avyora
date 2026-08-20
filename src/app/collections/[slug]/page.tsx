"use client";

import { ProductGrid } from "@/components/product-card";
import { useLiveCatalog } from "@/store/shop-store";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, collections } = useLiveCatalog();
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-3xl font-medium tracking-tight">Collection not found</h1>
        <Link href="/shop" className="mt-6 inline-block text-sm underline">
          Shop jewellery
        </Link>
      </div>
    );
  }

  const assigned = (
    collection.productSlugs.length
      ? collection.productSlugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean)
      : products.filter((p) => p.collection === collection.slug)
  ) as typeof products;

  return (
    <div>
      <section className="relative h-[48vh] min-h-[320px]">
        <Image src={collection.image} alt={collection.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative flex h-full flex-col justify-end px-4 pb-12 text-ivory">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-[11px] tracking-[0.24em] uppercase text-gold">Collection</p>
            <h1 className="mt-2 font-serif text-6xl">{collection.name}</h1>
            <p className="mt-3 max-w-lg text-sm text-ivory/80">{collection.tagline}</p>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-16">
        <p className="mb-10 max-w-2xl text-sm leading-7 text-ink-soft">{collection.description}</p>
        <ProductGrid products={assigned} />
      </div>
    </div>
  );
}
