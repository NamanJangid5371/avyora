"use client";

import { seedAdminOps, type AdminOps } from "@/data/admin-ops";
import { collections as seedCollections, coupons as seedCoupons, products as seedProducts } from "@/data/catalog";
import type { Collection, Coupon, Product } from "@/data/types";
import { campaign as seedCampaign } from "@/data/content";
import { clearAdminCookie, setAdminCookie } from "@/lib/host";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Address,
  AuditEntry,
  Campaign,
  CartItem,
  Customer,
  NotificationPrefs,
  Order,
  User,
} from "./shop-types";

export type { Address, CartItem, Customer, NotificationPrefs, Order, User };

export function isPublished(product: Product) {
  return !product.status || product.status === "published";
}

function seedCatalog(): Product[] {
  return seedProducts.map((p) => ({
    ...p,
    status: "published" as const,
    reviews: p.reviews.map((r) => ({ ...r, status: "visible" as const })),
  }));
}

function seedCouponList(): Coupon[] {
  return seedCoupons.map((c) => ({ ...c, active: true, usageCount: 0 }));
}

function withLiveReviews(product: Product) {
  return {
    ...product,
    reviews: product.reviews.filter((r) => !r.status || r.status === "visible"),
    reviewCount: product.reviews.filter((r) => !r.status || r.status === "visible").length,
  };
}

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  orders: Order[];
  couponCode: string;
  catalog: Product[];
  collections: Collection[];
  coupons: Coupon[];
  customers: Customer[];
  campaigns: Campaign[];
  mediaUrls: string[];
  audit: AuditEntry[];
  ops: AdminOps;
  hydrated: boolean;
  setHydrated: () => void;
  addToCart: (productId: string, sku: string, quantity?: number) => void;
  updateQty: (sku: string, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyCoupon: (code: string) => string;
  clearCoupon: () => void;
  login: (email: string, password: string) => string | null;
  staffLogin: (email: string, password: string) => string | null;
  register: (name: string, email: string, password: string) => string | null;
  logout: () => void;
  requestPasswordReset: (email: string) => { ok: true; token?: string; message: string } | { ok: false; message: string };
  resetPassword: (email: string, token: string, password: string) => string | null;
  changePassword: (currentPassword: string, newPassword: string) => string | null;
  setDefaultAddress: (addressId: string) => void;
  resendVerification: () => string | null;
  verifyEmail: () => void;
  updateNotifications: (prefs: Partial<NotificationPrefs>) => void;
  saveAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  placeOrder: (address: Address) => Order | { error: string };
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  requestReturn: (id: string) => void;
  refundOrder: (id: string) => void;
  cancelOrder: (id: string, reason: string) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  setVariantStock: (productId: string, sku: string, stock: number, reason?: string) => void;
  upsertCollection: (collection: Collection) => void;
  deleteCollection: (slug: string) => void;
  upsertCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  upsertCustomer: (customer: Customer) => void;
  setReviewStatus: (productId: string, reviewId: string, status: NonNullable<Product["reviews"][0]["status"]>) => void;
  upsertCampaign: (campaign: Campaign) => void;
  addMediaUrl: (url: string) => void;
  resetCatalog: () => void;
  importCatalog: (payload: { catalog: Product[]; collections?: Collection[]; coupons?: Coupon[] }) => void;
  applyCommerce: (snapshot: {
    catalog: Product[];
    collections: Collection[];
    coupons: Coupon[];
    customers: Customer[];
    orders: Order[];
    campaigns: Campaign[];
    mediaUrls: string[];
    audit: AuditEntry[];
    ops?: AdminOps;
  }) => void;
  setOps: (ops: AdminOps) => void;
  logSearch: (query: string, results: number) => void;
};

function findProduct(catalog: Product[], id: string) {
  return catalog.find((p) => p.id === id);
}

function couponValid(coupon: Coupon | undefined, subtotal: number) {
  if (!coupon || coupon.active === false) return false;
  if (subtotal < coupon.minOrder) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (coupon.startsAt && today < coupon.startsAt) return false;
  if (coupon.endsAt && today > coupon.endsAt) return false;
  if (coupon.usageLimit && (coupon.usageCount ?? 0) >= coupon.usageLimit) return false;
  return true;
}

function cartTotals(
  cart: CartItem[],
  couponCode: string,
  catalog: Product[],
  coupons: Coupon[],
  freeShippingMin = 7999,
) {
  const lines = cart.map((item) => {
    const product = findProduct(catalog, item.productId);
    const variant = product?.variants.find((v) => v.sku === item.sku);
    const unit = variant ? variant.salePrice ?? variant.price : 0;
    return unit * item.quantity;
  });
  const subtotal = lines.reduce((a, b) => a + b, 0);
  const coupon = coupons.find((c) => c.code === couponCode.toUpperCase());
  let discount = 0;
  if (couponValid(coupon, subtotal) && coupon) {
    if (coupon.type === "percent") {
      discount = Math.round(subtotal * (coupon.value / 100));
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === "flat") {
      discount = coupon.value;
    }
  }
  const freeShip = couponValid(coupon, subtotal) && coupon?.type === "free_shipping";
  const shipping = freeShip || subtotal - discount >= freeShippingMin || subtotal === 0 ? 0 : 199;
  return { subtotal, discount, shipping, total: Math.max(0, subtotal - discount + shipping), coupon };
}

function audit(actor: string, action: string, detail: string): AuditEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    actor,
    action,
    detail,
  };
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      user: null,
      orders: [],
      couponCode: "",
      catalog: seedCatalog(),
      collections: seedCollections.map((c) => ({ ...c })),
      coupons: seedCouponList(),
      customers: [],
      campaigns: [
        {
          id: "camp-bridal",
          title: seedCampaign.title,
          body: seedCampaign.body,
          image: seedCampaign.image,
          href: "/shop?tag=bridal",
          active: true,
        },
      ],
      mediaUrls: [],
      audit: [],
      ops: seedAdminOps(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      addToCart: (productId, sku, quantity = 1) => {
        const product = findProduct(get().catalog, productId);
        const variant = product?.variants.find((v) => v.sku === sku);
        if (!product || !isPublished(product) || !variant || variant.stock < 1) return;
        const existing = get().cart.find((i) => i.sku === sku);
        const nextQty = (existing?.quantity ?? 0) + quantity;
        if (nextQty > variant.stock) return;
        set({
          cart: existing
            ? get().cart.map((i) => (i.sku === sku ? { ...i, quantity: nextQty } : i))
            : [...get().cart, { productId, sku, quantity }],
        });
      },
      updateQty: (sku, quantity) => {
        if (quantity < 1) {
          set({ cart: get().cart.filter((i) => i.sku !== sku) });
          return;
        }
        set({
          cart: get().cart.map((i) => (i.sku === sku ? { ...i, quantity } : i)),
        });
      },
      removeFromCart: (sku) => set({ cart: get().cart.filter((i) => i.sku !== sku) }),
      clearCart: () => set({ cart: [], couponCode: "" }),
      toggleWishlist: (productId) => {
        const has = get().wishlist.includes(productId);
        set({
          wishlist: has ? get().wishlist.filter((id) => id !== productId) : [...get().wishlist, productId],
        });
      },
      applyCoupon: (code) => {
        const found = get().coupons.find((c) => c.code === code.trim().toUpperCase() && c.active !== false);
        if (!found) return "This code is not valid.";
        const min = get().ops?.settings.freeShippingMin ?? 7999;
        const { subtotal } = cartTotals(get().cart, found.code, get().catalog, get().coupons, min);
        if (!couponValid(found, subtotal)) return `This code cannot be used on the current bag.`;
        set({ couponCode: found.code });
        return `Applied ${found.label}.`;
      },
      clearCoupon: () => set({ couponCode: "" }),
      login: (email, password) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized.includes("@")) return "Enter a valid email address.";
        if (!password) return "Password is required.";

        const roster = get().ops?.adminUsers.find((u) => u.email.toLowerCase() === normalized);
        if (roster) {
          return "Staff accounts use the atelier staff login on port 3001 — not the customer sign-in.";
        }

        const existing = get().customers.find((c) => c.email.toLowerCase() === normalized);
        if (!existing) return "Incorrect email or password.";

        if (existing.status === "blocked") {
          return "This account is disabled. Please contact client care for help.";
        }

        if (existing.lockUntil && +new Date(existing.lockUntil) > Date.now()) {
          return "Too many attempts. Please try again in a few minutes.";
        }

        const passwordOk =
          existing.password && existing.password === password
            ? true
            : !existing.password && password.length >= 8;

        if (!passwordOk) {
          const fails = (existing.failedLogins ?? 0) + 1;
          const lockUntil = fails >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : undefined;
          set({
            customers: get().customers.map((c) =>
              c.id === existing.id
                ? { ...c, failedLogins: fails, lockUntil: lockUntil ?? c.lockUntil }
                : c,
            ),
          });
          return fails >= 5
            ? "Too many attempts. Please try again in a few minutes."
            : "Incorrect email or password.";
        }

        set({
          customers: get().customers.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  password: c.password ?? password,
                  failedLogins: 0,
                  lockUntil: undefined,
                }
              : c,
          ),
          user: {
            id: existing.id,
            name: existing.name,
            email: existing.email,
            role: "customer",
          },
        });
        return null;
      },
      staffLogin: (email, password) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized.includes("@")) return "Enter a valid staff email.";
        if (!password) return "Password is required.";

        const customer = get().customers.find((c) => c.email.toLowerCase() === normalized);
        if (customer && !get().ops?.adminUsers.some((u) => u.email.toLowerCase() === normalized)) {
          return "Customer accounts cannot access the admin portal. Use the storefront sign-in.";
        }

        const roster = get().ops?.adminUsers.find((u) => u.email.toLowerCase() === normalized && u.active);
        if (!roster) return "Incorrect staff email or password.";
        if (password !== "avyora123") return "Incorrect staff email or password.";

        setAdminCookie({ name: roster.name, email: roster.email });
        set({
          user: { id: roster.id, name: roster.name, email: roster.email, role: "admin" },
        });
        return null;
      },
      register: (name, email, password) => {
        const displayName = name.trim();
        const normalized = email.trim().toLowerCase();
        if (!displayName) return "Please enter your name.";
        if (!normalized.includes("@")) return "Enter a valid email address.";
        if (password.length < 8) return "Password must be at least 8 characters.";
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
          return "Password must include at least one letter and one number.";
        }

        const roster = get().ops?.adminUsers.find((u) => u.email.toLowerCase() === normalized);
        if (roster) return "This email is reserved for atelier staff. Use a different email for your client account.";

        const existing = get().customers.find((c) => c.email.toLowerCase() === normalized);
        if (existing) return "An account already exists for this email. Sign in instead.";

        const customer = {
          id: `c-${normalized}`,
          name: displayName,
          email: normalized,
          password,
          createdAt: new Date().toISOString(),
          status: "active" as const,
          groupId: "g-regular",
          addresses: [] as Address[],
          emailVerified: false,
          notifications: { orders: true, marketing: false, security: true },
        };

        set({
          customers: [customer, ...get().customers],
          user: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            role: "customer",
          },
        });
        return null;
      },
      logout: () => {
        clearAdminCookie();
        set({ user: null });
      },
      requestPasswordReset: (email) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized.includes("@")) return { ok: false, message: "Enter a valid email address." };
        const existing = get().customers.find((c) => c.email.toLowerCase() === normalized);
        // Always show the same safe confirmation (don't reveal whether account exists).
        const message =
          "If an account exists for that email, recovery instructions have been sent. Check your inbox.";
        if (!existing || existing.status === "blocked") return { ok: true, message };
        const token = `rst-${Math.random().toString(36).slice(2, 10)}`;
        set({
          customers: get().customers.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  resetToken: token,
                  resetExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                }
              : c,
          ),
        });
        // Demo: return token so the UI can complete reset without email delivery.
        return { ok: true, message, token };
      },
      resetPassword: (email, token, password) => {
        const normalized = email.trim().toLowerCase();
        if (password.length < 8) return "Password must be at least 8 characters.";
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
          return "Password must include at least one letter and one number.";
        }
        const existing = get().customers.find((c) => c.email.toLowerCase() === normalized);
        if (!existing || !existing.resetToken || existing.resetToken !== token) {
          return "This recovery link is invalid or has expired.";
        }
        if (existing.resetExpiresAt && +new Date(existing.resetExpiresAt) < Date.now()) {
          return "This recovery link has expired. Request a new one.";
        }
        set({
          customers: get().customers.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  password,
                  resetToken: undefined,
                  resetExpiresAt: undefined,
                  failedLogins: 0,
                  lockUntil: undefined,
                }
              : c,
          ),
        });
        return null;
      },
      changePassword: (currentPassword, newPassword) => {
        const user = get().user;
        if (!user || user.role !== "customer") return "Sign in to change your password.";
        const existing = get().customers.find((c) => c.email.toLowerCase() === user.email.toLowerCase());
        if (!existing) return "Account not found.";
        if (!existing.password || existing.password !== currentPassword) {
          return "Current password is incorrect.";
        }
        if (newPassword.length < 8) return "New password must be at least 8 characters.";
        if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
          return "Password must include at least one letter and one number.";
        }
        if (newPassword === currentPassword) return "Choose a password different from your current one.";
        set({
          customers: get().customers.map((c) =>
            c.id === existing.id ? { ...c, password: newPassword } : c,
          ),
        });
        return null;
      },
      setDefaultAddress: (addressId) => {
        const user = get().user;
        if (!user || user.role !== "customer") return;
        const email = user.email.toLowerCase();
        set({
          customers: get().customers.map((c) =>
            c.email.toLowerCase() === email
              ? {
                  ...c,
                  addresses: (c.addresses ?? []).map((a) => ({
                    ...a,
                    isDefault: a.id === addressId,
                  })),
                }
              : c,
          ),
        });
      },
      resendVerification: () => {
        const user = get().user;
        if (!user || user.role !== "customer") return "Sign in to verify your email.";
        const existing = get().customers.find((c) => c.email.toLowerCase() === user.email.toLowerCase());
        if (!existing) return "Account not found.";
        if (existing.emailVerified) return "Your email is already verified.";
        return null;
      },
      verifyEmail: () => {
        const user = get().user;
        if (!user || user.role !== "customer") return;
        set({
          customers: get().customers.map((c) =>
            c.email.toLowerCase() === user.email.toLowerCase() ? { ...c, emailVerified: true } : c,
          ),
        });
      },
      updateNotifications: (prefs) => {
        const user = get().user;
        if (!user || user.role !== "customer") return;
        set({
          customers: get().customers.map((c) =>
            c.email.toLowerCase() === user.email.toLowerCase()
              ? {
                  ...c,
                  notifications: {
                    orders: prefs.orders ?? c.notifications?.orders ?? true,
                    marketing: prefs.marketing ?? c.notifications?.marketing ?? false,
                    security: prefs.security ?? c.notifications?.security ?? true,
                  },
                }
              : c,
          ),
        });
      },
      saveAddress: (address) => {
        const user = get().user;
        // Addresses belong to a signed-in customer only — never a shared default.
        if (!user || user.role !== "customer") return;
        const email = user.email.toLowerCase();
        const customers = get().customers;
        const existing = customers.find((c) => c.email.toLowerCase() === email);
        if (!existing) {
          set({
            customers: [
              {
                id: `c-${email}`,
                name: user.name,
                email,
                createdAt: new Date().toISOString(),
                status: "active",
                addresses: [{ ...address, id: address.id || `addr-${Date.now()}`, isDefault: true }],
              },
              ...customers,
            ],
          });
          return;
        }
        const list = existing.addresses ?? [];
        const id = address.id || `addr-${Date.now()}`;
        const nextAddr = {
          ...address,
          id,
          isDefault: address.isDefault ?? (list.length === 0 || list.every((a) => !a.isDefault)),
        };
        let addresses = list.some((a) => a.id === id)
          ? list.map((a) => (a.id === id ? nextAddr : a))
          : [...list, nextAddr];
        if (nextAddr.isDefault) {
          addresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
        }
        set({
          customers: customers.map((c) => (c.id === existing.id ? { ...c, addresses } : c)),
        });
      },
      removeAddress: (addressId) => {
        const user = get().user;
        if (!user || user.role !== "customer") return;
        const email = user.email.toLowerCase();
        set({
          customers: get().customers.map((c) => {
            if (c.email.toLowerCase() !== email) return c;
            const addresses = (c.addresses ?? []).filter((a) => a.id !== addressId);
            if (addresses.length && !addresses.some((a) => a.isDefault)) {
              addresses[0] = { ...addresses[0], isDefault: true };
            }
            return { ...c, addresses };
          }),
        });
      },
      placeOrder: (address) => {
        const { cart, couponCode, catalog, coupons, user } = get();
        if (!cart.length) return { error: "Your bag is empty." };
        for (const item of cart) {
          const product = findProduct(catalog, item.productId);
          const variant = product?.variants.find((v) => v.sku === item.sku);
          if (!variant || variant.stock < item.quantity) {
            return { error: "A piece in your bag is no longer available in that quantity." };
          }
        }
        const totals = cartTotals(cart, couponCode, catalog, coupons);
        const nextCatalog = catalog.map((product) => ({
          ...product,
          variants: product.variants.map((variant) => {
            const line = cart.find((i) => i.sku === variant.sku && i.productId === product.id);
            return line ? { ...variant, stock: variant.stock - line.quantity } : variant;
          }),
        }));
        const order: Order = {
          id: `AV${Date.now().toString().slice(-8)}`,
          createdAt: new Date().toISOString(),
          status: "Confirmed",
          items: cart.map((item) => {
            const product = findProduct(catalog, item.productId)!;
            const variant = product.variants.find((v) => v.sku === item.sku)!;
            return {
              productId: item.productId,
              sku: item.sku,
              name: product.name,
              image: product.images[0],
              quantity: item.quantity,
              price: variant.salePrice ?? variant.price,
            };
          }),
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          total: totals.total,
          coupon: totals.coupon?.code,
          address,
          paymentId: `pay_${Math.random().toString(36).slice(2, 12)}`,
          trackingId: `AVSHIP${Math.floor(100000 + Math.random() * 900000)}`,
          customerEmail: user?.email,
          paymentStatus: "Success",
          paymentMethod: "Razorpay",
          tax: Math.round(totals.subtotal * ((get().ops.settings.taxPercent || 0) / 100)),
        };
        const nextCoupons = totals.coupon
          ? get().coupons.map((c) => (c.code === totals.coupon?.code ? { ...c, usageCount: (c.usageCount ?? 0) + 1 } : c))
          : get().coupons;
        let customers = get().customers;
        if (user?.role !== "admin") {
          const email = user?.email ?? `${address.phone}@guest.avyora`;
          if (!customers.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
            customers = [
              {
                id: `c-${email.toLowerCase()}`,
                name: address.name,
                email,
                phone: address.phone,
                createdAt: new Date().toISOString(),
                status: "active",
              },
              ...customers,
            ];
          }
        }
        set({
          catalog: nextCatalog,
          orders: [order, ...get().orders],
          cart: [],
          couponCode: "",
          coupons: nextCoupons,
          customers,
          audit: [audit(user?.email ?? "guest", "order.created", order.id), ...get().audit].slice(0, 200),
        });
        return order;
      },
      updateOrderStatus: (id, status) => {
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)),
          audit: [audit(get().user?.email ?? "admin", "order.status", `${id} → ${status}`), ...get().audit].slice(0, 200),
        });
      },
      updateOrder: (id, patch) =>
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }),
      requestReturn: (id) =>
        set({
          orders: get().orders.map((o) =>
            o.id === id && o.status === "Delivered" ? { ...o, status: "Return Requested" } : o,
          ),
        }),
      cancelOrder: (id, reason) =>
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, status: "Cancelled", paymentStatus: "Cancelled", cancelReason: reason } : o,
          ),
        }),
      refundOrder: (id) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order) return;
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, status: "Refunded", refundedAmount: o.total, paymentStatus: "Refunded" } : o,
          ),
          audit: [audit(get().user?.email ?? "admin", "order.refund", id), ...get().audit].slice(0, 200),
        });
      },
      upsertProduct: (product) => {
        const exists = get().catalog.some((p) => p.id === product.id);
        set({
          catalog: exists
            ? get().catalog.map((p) => (p.id === product.id ? product : p))
            : [product, ...get().catalog],
          audit: [
            audit(get().user?.email ?? "admin", exists ? "product.updated" : "product.created", product.name),
            ...get().audit,
          ].slice(0, 200),
        });
      },
      deleteProduct: (id) => {
        const product = findProduct(get().catalog, id);
        set({
          catalog: get().catalog.filter((p) => p.id !== id),
          audit: [audit(get().user?.email ?? "admin", "product.deleted", product?.name ?? id), ...get().audit].slice(0, 200),
        });
      },
      setVariantStock: (productId, sku, stock, reason = "Manual adjustment") => {
        const product = findProduct(get().catalog, productId);
        const prev = product?.variants.find((v) => v.sku === sku)?.stock ?? 0;
        set({
          catalog: get().catalog.map((p) =>
            p.id === productId
              ? { ...p, variants: p.variants.map((v) => (v.sku === sku ? { ...v, stock } : v)) }
              : p,
          ),
          ops: {
            ...get().ops,
            stockMoves: [
              {
                id: `sm-${Date.now()}`,
                productId,
                sku,
                delta: stock - prev,
                reason,
                at: new Date().toISOString(),
                actor: get().user?.email ?? "admin",
              },
              ...get().ops.stockMoves,
            ].slice(0, 200),
          },
        });
      },
      upsertCollection: (collection) => {
        const exists = get().collections.some((c) => c.slug === collection.slug);
        set({
          collections: exists
            ? get().collections.map((c) => (c.slug === collection.slug ? collection : c))
            : [...get().collections, collection],
          audit: [audit(get().user?.email ?? "admin", "collection.saved", collection.name), ...get().audit].slice(0, 200),
        });
      },
      deleteCollection: (slug) =>
        set({ collections: get().collections.filter((c) => c.slug !== slug) }),
      upsertCoupon: (coupon) => {
        const code = coupon.code.toUpperCase();
        const next = { ...coupon, code };
        const exists = get().coupons.some((c) => c.code === code);
        set({
          coupons: exists ? get().coupons.map((c) => (c.code === code ? next : c)) : [...get().coupons, next],
        });
      },
      deleteCoupon: (code) => set({ coupons: get().coupons.filter((c) => c.code !== code) }),
      upsertCustomer: (customer) => {
        const exists = get().customers.some((c) => c.id === customer.id);
        set({
          customers: exists
            ? get().customers.map((c) => (c.id === customer.id ? customer : c))
            : [customer, ...get().customers],
          audit: [audit(get().user?.email ?? "admin", "customer.updated", customer.email), ...get().audit].slice(0, 200),
        });
      },
      setReviewStatus: (productId, reviewId, status) =>
        set({
          catalog: get().catalog.map((p) =>
            p.id === productId
              ? { ...p, reviews: p.reviews.map((r) => (r.id === reviewId ? { ...r, status } : r)) }
              : p,
          ),
        }),
      upsertCampaign: (campaign) => {
        const exists = get().campaigns.some((c) => c.id === campaign.id);
        set({
          campaigns: exists
            ? get().campaigns.map((c) => (c.id === campaign.id ? campaign : c))
            : [campaign, ...get().campaigns],
        });
      },
      addMediaUrl: (url) => {
        if (!url || get().mediaUrls.includes(url)) return;
        set({ mediaUrls: [url, ...get().mediaUrls] });
      },
      resetCatalog: () =>
        set({
          catalog: seedCatalog(),
          collections: seedCollections.map((c) => ({ ...c })),
          coupons: seedCouponList(),
          audit: [audit(get().user?.email ?? "admin", "catalog.reset", "Restored seed catalogue"), ...get().audit].slice(0, 200),
        }),
      importCatalog: (payload) =>
        set({
          catalog: payload.catalog,
          collections: payload.collections ?? get().collections,
          coupons: payload.coupons ?? get().coupons,
        }),
      applyCommerce: (snapshot) =>
        set({
          catalog: snapshot.catalog ?? get().catalog,
          collections: snapshot.collections ?? get().collections,
          coupons: snapshot.coupons ?? get().coupons,
          customers: snapshot.customers ?? get().customers,
          orders: snapshot.orders ?? get().orders,
          campaigns: snapshot.campaigns ?? get().campaigns,
          mediaUrls: snapshot.mediaUrls ?? get().mediaUrls,
          audit: snapshot.audit ?? get().audit,
          ops: {
            ...seedAdminOps(),
            ...(snapshot.ops ?? get().ops ?? {}),
            adminUsers:
              snapshot.ops?.adminUsers?.length
                ? snapshot.ops.adminUsers
                : get().ops?.adminUsers?.length
                  ? get().ops!.adminUsers
                  : seedAdminOps().adminUsers,
          },
        }),
      setOps: (ops) => set({ ops }),
      logSearch: (query, results) => {
        const q = query.trim().toLowerCase();
        if (!q) return;
        const ops = get().ops ?? seedAdminOps();
        const existing = ops.searches.find((s) => s.query === q);
        const searches = existing
          ? ops.searches.map((s) => (s.query === q ? { ...s, count: s.count + 1, results } : s))
          : [{ query: q, count: 1, results }, ...ops.searches].slice(0, 50);
        set({ ops: { ...ops, searches } });
      },
    }),
    {
      name: "avyora-commerce-v2",
      skipHydration: true,
      partialize: (s) => ({
        cart: s.cart,
        wishlist: s.wishlist,
        user: s.user?.role === "admin" ? null : s.user,
        couponCode: s.couponCode,
      }),
    },
  ),
);

export function useCartTotals() {
  const cart = useShopStore((s) => s.cart);
  const couponCode = useShopStore((s) => s.couponCode);
  const catalog = useShopStore((s) => s.catalog);
  const coupons = useShopStore((s) => s.coupons);
  const min = useShopStore((s) => s.ops?.settings.freeShippingMin ?? 7999);
  return cartTotals(cart, couponCode, catalog, coupons, min);
}

/** Addresses saved for the signed-in customer only. */
export function useCustomerAddresses() {
  const user = useShopStore((s) => s.user);
  const customers = useShopStore((s) => s.customers);
  if (!user || user.role !== "customer") return [];
  const customer = customers.find((c) => c.email.toLowerCase() === user.email.toLowerCase());
  return customer?.addresses ?? [];
}

export function useLiveCatalog() {
  const catalog = useShopStore((s) => s.catalog);
  const collections = useShopStore((s) => s.collections);
  const campaigns = useShopStore((s) => s.campaigns);
  const ops = useShopStore((s) => s.ops);
  const live = catalog.filter(isPublished).map(withLiveReviews);
  return { products: live, allProducts: catalog, collections, campaigns, ops };
}

export { seedProducts as products };
