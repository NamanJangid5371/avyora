import { seedAdminOps, type AdminOps } from "@/data/admin-ops";
import { collections as seedCollections, coupons as seedCoupons, products as seedProducts } from "@/data/catalog";
import { campaign as seedCampaign } from "@/data/content";
import type { Collection, Coupon, Product } from "@/data/types";
import type { AuditEntry, Campaign, Customer, Order } from "@/store/shop-types";
import fs from "fs";
import path from "path";

export type CommerceSnapshot = {
  catalog: Product[];
  collections: Collection[];
  coupons: Coupon[];
  customers: Customer[];
  orders: Order[];
  campaigns: Campaign[];
  mediaUrls: string[];
  audit: AuditEntry[];
  ops: AdminOps;
  updatedAt?: string;
};

const filePath = path.join(process.cwd(), "data", "commerce.json");

export function seedCommerce(): CommerceSnapshot {
  return {
    catalog: seedProducts.map((p) => ({
      ...p,
      status: "published" as const,
      reviews: p.reviews.map((r) => ({ ...r, status: "visible" as const })),
    })),
    collections: seedCollections.map((c) => ({ ...c })),
    coupons: seedCoupons.map((c) => ({ ...c, active: true, usageCount: 0 })),
    customers: [],
    orders: [],
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
  };
}

export function loadCommerce(): CommerceSnapshot {
  const seed = seedCommerce();
  try {
    if (!fs.existsSync(filePath)) {
      saveCommerce(seed);
      return seed;
    }
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as Partial<CommerceSnapshot>;
    const mergedOps = { ...seed.ops, ...parsed.ops };
    if (!parsed.ops?.adminUsers?.length) {
      mergedOps.adminUsers = seed.ops.adminUsers;
    }
    return {
      catalog: parsed.catalog ?? seed.catalog,
      collections: parsed.collections ?? seed.collections,
      coupons: parsed.coupons ?? seed.coupons,
      customers: parsed.customers ?? seed.customers,
      orders: parsed.orders ?? seed.orders,
      campaigns: parsed.campaigns ?? seed.campaigns,
      mediaUrls: parsed.mediaUrls ?? seed.mediaUrls,
      audit: parsed.audit ?? seed.audit,
      ops: mergedOps,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return seed;
  }
}

export function saveCommerce(snapshot: CommerceSnapshot) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const payload = { ...snapshot, updatedAt: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}
