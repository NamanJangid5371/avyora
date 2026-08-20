"use client";

import { cn } from "@/lib/cn";
import { STOREFRONT_ORIGIN } from "@/lib/host";
import { useShopStore } from "@/store/shop-store";
import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Percent,
  ScrollText,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Truck,
  Undo2,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const groups = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "*" },
      { href: "/admin/reports", label: "Reports", icon: BarChart3, perm: "reports" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package, perm: "products" },
      { href: "/admin/categories", label: "Categories", icon: Tag, perm: "categories" },
      { href: "/admin/brands", label: "Brands", icon: Store, perm: "categories" },
      { href: "/admin/attributes", label: "Attributes", icon: ClipboardList, perm: "products" },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse, perm: "inventory" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag, perm: "*" },
      { href: "/admin/payments", label: "Payments", icon: CreditCard, perm: "orders" },
      { href: "/admin/returns", label: "Returns & refunds", icon: Undo2, perm: "returns" },
      { href: "/admin/shipping", label: "Shipping", icon: Truck, perm: "shipping" },
    ],
  },
  {
    label: "Customers",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users, perm: "*" },
      { href: "/admin/groups", label: "Customer groups", icon: Users, perm: "orders" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: Percent, perm: "*" },
      { href: "/admin/campaigns", label: "Promotions", icon: Megaphone, perm: "*" },
      { href: "/admin/reviews", label: "Reviews", icon: Star, perm: "*" },
      { href: "/admin/search", label: "Search insights", icon: Search, perm: "*" },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: LayoutDashboard, perm: "*" },
      { href: "/admin/banners", label: "Banners", icon: ImageIcon, perm: "*" },
      { href: "/admin/pages", label: "Pages", icon: FolderOpen, perm: "*" },
      { href: "/admin/menus", label: "Menus", icon: Menu, perm: "*" },
      { href: "/admin/media", label: "Media", icon: ImageIcon, perm: "*" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: Bell, perm: "*" },
      { href: "/admin/settings", label: "Settings", icon: Settings, perm: "*" },
      { href: "/admin/users", label: "Admin users", icon: Shield, perm: "*" },
      { href: "/admin/audit", label: "Activity history", icon: ScrollText, perm: "*" },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useShopStore((s) => s.user);
  const hydrated = useShopStore((s) => s.hydrated);
  const ops = useShopStore((s) => s.ops);
  const logout = useShopStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const settings = ops?.settings;
  const account = ops?.adminUsers.find((a) => a.email.toLowerCase() === user?.email.toLowerCase());

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/staff-login");
      return;
    }
    if (account && !account.active) {
      logout();
      router.replace("/staff-login");
    }
  }, [user, hydrated, router, account, logout]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14110e] text-sm text-ivory/70">
        Checking admin access…
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#14110e] text-sm text-ivory/70">
        <p>Redirecting to staff sign in…</p>
        <Link href="/staff-login" className="text-ivory underline">
          Continue to staff login
        </Link>
      </div>
    );
  }

  function allowed(perm: string) {
    if (!account || account.permissions.includes("*")) return true;
    return perm === "*" || account.permissions.includes(perm);
  }

  return (
    <div className="flex min-h-screen bg-[#f7f3eb] text-ink">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-[#12100e] text-ivory lg:flex">
        <div className="px-5 py-7">
          <p className="font-serif text-2xl tracking-[0.16em]">{settings?.logoText ?? "AVYORA"}</p>
          <p className="mt-1 text-[10px] tracking-[0.2em] uppercase text-[#c4a574]">Admin</p>
          <p className="mt-2 text-[11px] text-ivory/45">{account?.role ?? "Administrator"}</p>
        </div>
        <nav className="flex-1 space-y-5 px-3 pb-6">
          {groups.map((group) => {
            const items = group.items.filter((i) => allowed(i.perm));
            if (!items.length) return null;
            return (
              <div key={group.label}>
                <p className="px-3 pb-2 text-[10px] tracking-[0.18em] uppercase text-ivory/35">{group.label}</p>
                {items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 border-l-2 px-3 py-2 text-sm transition",
                        active
                          ? "border-[#c4a574] bg-ivory/[0.07] text-ivory"
                          : "border-transparent text-ivory/55 hover:bg-ivory/[0.04] hover:text-ivory",
                      )}
                    >
                      <Icon size={15} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <p className="truncate text-ivory/70">{user.email}</p>
          <div className="mt-3 flex flex-col gap-2">
            <a href={STOREFRONT_ORIGIN} className="flex items-center gap-2 text-ivory/55 transition hover:text-ivory">
              <Store size={14} /> View store
            </a>
            <button
              onClick={() => {
                logout();
                router.replace("/staff-login");
              }}
              className="flex items-center gap-2 text-left text-ivory/55 transition hover:text-ivory"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-line bg-[#faf6ef]/90 px-4 py-3.5 backdrop-blur lg:px-8">
          <p className="text-sm text-ink-soft">Store operations · {settings?.name ?? "Avyora"}</p>
          <a href={STOREFRONT_ORIGIN} className="text-xs uppercase tracking-widest text-ink-soft transition hover:text-ink">
            Storefront :3000
          </a>
        </header>
        {settings?.maintenance && (
          <div className="bg-ink px-4 py-2 text-center text-xs tracking-widest uppercase text-ivory">
            Maintenance mode is on — storefront should show a pause state
          </div>
        )}
        <div className="px-4 py-9 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
