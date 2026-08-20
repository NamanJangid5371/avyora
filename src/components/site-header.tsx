"use client";

import { nav, site } from "@/data/content";
import { cn } from "@/lib/cn";
import { isAdminHost } from "@/lib/host";
import { useShopStore } from "@/store/shop-store";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useShopStore((s) => s.cart);
  const wishlist = useShopStore((s) => s.wishlist);
  const user = useShopStore((s) => s.user);
  const ops = useShopStore((s) => s.ops);
  const settings = ops?.settings;
  const headerNav = (ops?.menus ?? [])
    .filter((m) => m.location === "header" && m.enabled)
    .sort((a, b) => a.order - b.order);
  const links = headerNav.length ? headerNav : nav;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [adminHost, setAdminHost] = useState(
    () => process.env.NEXT_PUBLIC_AVYORA_APP === "admin",
  );
  const count = cart.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    setAdminHost(isAdminHost());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearch("");
  }

  if (adminHost || pathname.startsWith("/admin") || pathname.startsWith("/staff-login")) return null;

  return (
    <header className="sticky top-0 z-40">
      {settings?.maintenance ? (
        <div className="bg-[#8a6d3b] px-4 py-2 text-center text-[11px] tracking-[0.18em] uppercase text-ivory">
          The atelier is in maintenance. Browsing is open; checkout is paused.
        </div>
      ) : null}
      <div className="bg-ink text-ivory text-[11px] tracking-[0.22em] uppercase">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-2">
          <span>BIS hallmarked</span>
          <span className="hidden sm:inline">Insured shipping</span>
          <span className="hidden md:inline">15-day exchange</span>
        </div>
      </div>
      <div
        className={cn(
          "border-b border-line backdrop-blur-md transition-colors",
          scrolled ? "bg-paper/92" : "bg-paper/80",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[12px] tracking-[0.18em] uppercase text-ink-soft transition-colors hover:text-ink",
                  pathname === item.href && "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-serif text-3xl tracking-[0.18em]">
            {settings?.logoText ?? site.name}
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <form onSubmit={onSearch} className="hidden items-center border-b border-line md:flex">
              <Search size={16} className="text-ink-soft" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pieces"
                className="w-40 bg-transparent px-2 py-1 text-sm placeholder:text-ink-soft/70"
              />
            </form>
            <Link href="/search" className="md:hidden" aria-label="Search">
              <Search size={18} />
            </Link>
            <Link href={user ? "/account" : "/login?next=/account"} aria-label="Account">
              <User size={18} />
            </Link>
            <Link href="/wishlist" className="relative" aria-label="Wishlist">
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 text-[10px]">{wishlist.length}</span>
              )}
            </Link>
            <Link href="/cart" className="relative" aria-label="Bag">
              <ShoppingBag size={18} />
              {count > 0 && <span className="absolute -right-2 -top-2 text-[10px]">{count}</span>}
            </Link>
          </div>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-paper lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="font-serif text-2xl tracking-[0.16em]">{settings?.logoText ?? site.name}</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X />
            </button>
          </div>
          <nav className="flex flex-col gap-6 px-6 pt-8">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="text-3xl font-medium tracking-tight">
                {item.label}
              </Link>
            ))}
            <Link href="/shop?sort=new" className="text-sm tracking-widest uppercase text-ink-soft">
              New arrivals
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
