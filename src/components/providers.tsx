"use client";

import { ToastProvider } from "@/components/toast";
import { fetchCommerce, isAdminHost, putCommerce, readAdminCookie } from "@/lib/host";
import { seedAdminOps } from "@/data/admin-ops";
import { useShopStore } from "@/store/shop-store";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const COMMERCE_KEYS = [
  "catalog",
  "collections",
  "coupons",
  "customers",
  "orders",
  "campaigns",
  "mediaUrls",
  "audit",
  "ops",
] as const;

function restoreAdminSession() {
  const cookie = readAdminCookie();
  if (!cookie) return;
  const ops = useShopStore.getState().ops ?? seedAdminOps();
  const roster = ops.adminUsers.find(
    (u) => u.email.toLowerCase() === cookie.email.toLowerCase() && u.active,
  );
  if (!roster) return;
  useShopStore.setState({
    user: {
      id: roster.id,
      name: roster.name,
      email: roster.email,
      role: "admin",
    },
    ops,
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const lastSyncRef = useRef<string | undefined>(undefined);
  const bootedRef = useRef(false);

  pathnameRef.current = pathname;

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        await useShopStore.persist.rehydrate();
      } catch {
        /* empty / corrupt storage — continue with seeds */
      }
      if (cancelled) return;

      // Never keep a customer session on the admin host.
      if (isAdminHost()) {
        const current = useShopStore.getState().user;
        if (current && current.role !== "admin") {
          useShopStore.setState({ user: null });
        }
      }

      // Mark ready before network so admin layout can redirect to login
      // instead of hanging on "Checking admin access…".
      restoreAdminSession();
      useShopStore.getState().setHydrated();

      try {
        const data = await fetchCommerce();
        if (cancelled) return;
        lastSyncRef.current = data.updatedAt;
        useShopStore.getState().applyCommerce(data);
        if (isAdminHost()) restoreAdminSession();
      } catch {
        /* keep seed catalogue if API is not up yet */
      }
    }

    if (!bootedRef.current) {
      bootedRef.current = true;
      void boot();
    } else if (!useShopStore.getState().hydrated) {
      void boot();
    }

    const unsub = useShopStore.subscribe((state, prev) => {
      if (!state.hydrated) return;
      const changed = COMMERCE_KEYS.some((key) => state[key] !== prev[key]);
      if (!changed) return;
      void putCommerce({
        catalog: state.catalog,
        collections: state.collections,
        coupons: state.coupons,
        customers: state.customers,
        orders: state.orders,
        campaigns: state.campaigns,
        mediaUrls: state.mediaUrls,
        audit: state.audit,
        ops: state.ops,
      });
    });

    const pullCommerce = () => {
      void fetchCommerce()
        .then((data) => {
          if (data.updatedAt && data.updatedAt === lastSyncRef.current) return;
          lastSyncRef.current = data.updatedAt;
          useShopStore.getState().applyCommerce(data);
          if (isAdminHost()) restoreAdminSession();
        })
        .catch(() => undefined);
    };

    const onFocus = () => {
      if (!isAdminHost()) pullCommerce();
    };

    window.addEventListener("focus", onFocus);

    const poll = window.setInterval(() => {
      const path = pathnameRef.current;
      if (!isAdminHost() && !path.startsWith("/admin")) pullCommerce();
    }, 3000);

    return () => {
      cancelled = true;
      unsub();
      window.removeEventListener("focus", onFocus);
      window.clearInterval(poll);
    };
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
