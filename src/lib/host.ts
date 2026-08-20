export const STOREFRONT_ORIGIN = process.env.NEXT_PUBLIC_STOREFRONT_ORIGIN ?? "http://localhost:3000";
export const ADMIN_ORIGIN = process.env.NEXT_PUBLIC_ADMIN_ORIGIN ?? "http://localhost:3001";

export type CommercePayload = {
  catalog: unknown;
  collections: unknown;
  coupons: unknown;
  customers: unknown;
  orders: unknown;
  campaigns: unknown;
  mediaUrls: unknown;
  audit: unknown;
  ops: unknown;
};

export async function fetchCommerce() {
  const res = await fetch(`/api/commerce?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load commerce data");
  return res.json();
}

export async function putCommerce(payload: CommercePayload) {
  await fetch("/api/commerce", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const COOKIE = "avyora_admin";

export function setAdminCookie(user: { name: string; email: string }) {
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearAdminCookie() {
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function readAdminCookie(): { name: string; email: string } | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function isAdminHost() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_AVYORA_APP === "admin" || process.env.AVYORA_APP === "admin";
  }
  if (process.env.NEXT_PUBLIC_AVYORA_APP === "admin") return true;
  return window.location.port === "3001" || window.location.origin === ADMIN_ORIGIN;
}
