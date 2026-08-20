"use client";

import { site } from "@/data/content";
import { isAdminHost } from "@/lib/host";
import { useShopStore } from "@/store/shop-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SiteFooter() {
  const pathname = usePathname();
  const ops = useShopStore((s) => s.ops);
  const settings = ops?.settings;
  const footerLinks = (ops?.menus ?? [])
    .filter((m) => m.location === "footer" && m.enabled)
    .sort((a, b) => a.order - b.order);
  const [adminHost, setAdminHost] = useState(
    () => process.env.NEXT_PUBLIC_AVYORA_APP === "admin",
  );
  const [year] = useState(() => new Date().getFullYear());

  useEffect(() => {
    setAdminHost(isAdminHost());
  }, []);

  if (adminHost || pathname.startsWith("/admin") || pathname.startsWith("/staff-login")) return null;
  return (
    <footer className="mt-auto border-t border-line bg-ivory/90">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-4xl tracking-[0.16em]">{settings?.logoText ?? site.name}</p>
          <div className="gold-rule mt-5" />
          <p className="mt-5 max-w-sm text-sm leading-7 text-ink-soft">
            {settings?.tagline ?? site.tagline} Hallmarked jewellery from Bengaluru, composed for a lifetime of wear.
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold-deep">Maison</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink-soft">
            {footerLinks.slice(0, 3).map((l) => (
              <Link key={l.id} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold-deep">Client care</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink-soft">
            {footerLinks.slice(3).map((l) => (
              <Link key={l.id} href={l.href}>
                {l.label}
              </Link>
            ))}
            <a href={`mailto:${settings?.email ?? site.email}`}>{settings?.email ?? site.email}</a>
            <p>{settings?.phone ?? site.phone}</p>
            <p>{settings?.address ?? site.address}</p>
          </div>
        </div>
      </div>
      <div className="gold-line" />
      <p className="px-4 py-6 text-center text-[11px] tracking-[0.18em] uppercase text-ink-soft">
        © {year} {settings?.name ?? "Avyora"} · Crafted in India
      </p>
    </footer>
  );
}
