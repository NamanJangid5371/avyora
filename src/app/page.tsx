"use client";

import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { hero } from "@/data/content";
import { useLiveCatalog } from "@/store/shop-store";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { products, collections, campaigns, ops } = useLiveCatalog();
  const featured = products.filter((p) => p.featured);
  const arrivals = products.filter((p) => p.newArrival);
  const bestsellers = products.filter((p) => p.bestSeller);
  const campaign = campaigns.find((c) => c.active) ?? campaigns[0];
  const banners = ops?.banners ?? [];
  const heroBanner = banners.find((b) => b.placement === "hero" && b.enabled) ?? banners[0];
  const sections = [...(ops?.homepageSections ?? [])].sort((a, b) => a.order - b.order);
  const on = (id: string) => sections.find((s) => s.id === id)?.enabled !== false;

  return (
    <div>
      {on("hero") && (
        <section className="relative min-h-[92vh] overflow-hidden">
          <Image src={heroBanner?.image ?? hero.image} alt="" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-ink/30 to-ink/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(15,12,10,0.45)_100%)]" />
          <div className="absolute inset-x-0 top-8 z-10 hidden justify-center gap-10 text-[10px] tracking-[0.28em] uppercase text-ivory/80 md:flex">
            <span>BIS hallmarked</span>
            <span className="text-champagne">·</span>
            <span>IGI certified</span>
            <span className="text-champagne">·</span>
            <span>Insured delivery</span>
          </div>
          <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-4 pb-24 pt-36 text-ivory">
            <p className="text-[11px] tracking-[0.28em] uppercase text-champagne rise">{hero.kicker}</p>
            <div className="gold-rule mt-4 rise rise-delay-1" />
            <h1 className="mt-5 max-w-xl font-serif text-6xl leading-[0.95] whitespace-pre-line md:text-8xl rise rise-delay-1">
              {heroBanner?.title ?? hero.title}
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-ivory/78 rise rise-delay-2">
              {heroBanner?.description ?? hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 rise rise-delay-3">
              <Link href={heroBanner?.href ?? "/shop"} className="btn-primary bg-ivory text-ink shadow-none hover:bg-paper">
                {heroBanner?.cta ?? hero.cta}
              </Link>
              <Link href="/collections/celeste" className="btn-secondary on-dark">
                {hero.secondary}
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="overflow-hidden border-y border-line bg-espresso py-3.5 text-ivory">
        <div className="animate-marquee flex w-max gap-16 text-[11px] tracking-[0.28em] uppercase">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="flex gap-16">
              <span>Hallmarked gold</span>
              <span>IGI certified diamonds</span>
              <span>Insured delivery</span>
              <span>Lifetime craft warranty</span>
            </span>
          ))}
        </div>
      </div>

      {on("collections") && (
        <section className="mx-auto max-w-7xl px-4 py-28">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="section-kicker">Collections</p>
                <h2 className="section-title">Three chapters</h2>
              </div>
              <Link href="/shop" className="hidden text-[11px] tracking-[0.2em] uppercase text-ink-soft transition hover:text-ink md:inline">
                All jewellery
              </Link>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {collections.map((c, i) => (
              <Reveal key={c.slug} delay={i * 90}>
                <Link href={`/collections/${c.slug}`} className="group relative block min-h-[460px] overflow-hidden">
                  <Image src={c.image} alt={c.name} fill className="object-cover transition duration-[900ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-ink/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-9 text-ivory">
                    <div className="gold-rule mb-4 opacity-80" />
                    <p className="font-serif text-4xl">{c.name}</p>
                    <p className="mt-2 text-sm text-ivory/75">{c.tagline}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {on("bestsellers") && (
        <section className="bg-ivory/70 py-28">
          <div className="mx-auto max-w-7xl px-4">
            <Reveal>
              <p className="section-kicker">Bestsellers</p>
              <h2 className="section-title">Most requested</h2>
            </Reveal>
            <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
              {bestsellers.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {on("campaign") && campaign && (
        <section className="grid md:grid-cols-2">
          <div className="relative min-h-[560px]">
            <Image src={campaign.image} alt="" fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center bg-espresso px-8 py-24 text-ivory md:px-16">
            <Reveal>
              <p className="text-[11px] tracking-[0.24em] uppercase text-champagne">Campaign</p>
              <div className="gold-rule mt-4" />
              <h2 className="mt-5 font-serif text-5xl leading-tight">{campaign.title}</h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-ivory/72">{campaign.body}</p>
              <Link href={campaign.href} className="btn-secondary on-dark mt-10 w-fit">
                Explore
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {on("arrivals") && (
        <section className="mx-auto max-w-7xl px-4 py-28">
          <Reveal>
            <div className="flex items-end justify-between">
              <h2 className="section-title mt-0">Just arrived</h2>
              <Link href="/shop?sort=new" className="text-[11px] tracking-[0.2em] uppercase text-ink-soft transition hover:text-ink">
                View all
              </Link>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
            {arrivals.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {on("trust") && (
        <section className="border-t border-line px-4 py-24">
          <div className="mx-auto grid max-w-5xl gap-14 text-center md:grid-cols-3">
            {[
              ["Certified", "IGI, GRS and BIS documentation packed with every eligible piece."],
              ["Made to last", "Lifetime manufacturing warranty and considered aftercare."],
              ["Private shipping", "Discreet, insured parcels from the Bengaluru atelier."],
            ].map(([t, b], i) => (
              <Reveal key={t} delay={i * 80}>
                <div className="gold-rule mx-auto mb-5" />
                <p className="font-serif text-3xl">{t}</p>
                <p className="prose-calm mx-auto mt-4 text-center">{b}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {on("featured") && (
        <section className="mx-auto max-w-7xl px-4 pb-28">
          <Reveal>
            <p className="section-kicker">Editor&apos;s selection</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
