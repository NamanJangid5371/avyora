export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  banner: string;
  parentId?: string;
  order: number;
  enabled: boolean;
  showInMenu: boolean;
  promo?: string;
  seoTitle: string;
  seoDescription: string;
};

export type BrandRecord = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  enabled: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type AttributeRecord = {
  id: string;
  name: string;
  values: string[];
};

export type ShippingMethod = {
  id: string;
  name: string;
  carrier: string;
  charge: number;
  freeAbove: number;
  eta: string;
  zones: string;
  enabled: boolean;
};

export type PaymentMethod = {
  id: string;
  name: string;
  details: string;
  enabled: boolean;
};

export type CmsPage = {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  location: "header" | "footer";
  order: number;
  enabled: boolean;
};

export type Banner = {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  cta: string;
  placement: "hero" | "promo" | "strip";
  device: "all" | "desktop" | "mobile";
  enabled: boolean;
  order: number;
  startsAt?: string;
  endsAt?: string;
};

export type HomepageSection = {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
};

export type StoreSettings = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  currency: string;
  taxPercent: number;
  freeShippingMin: number;
  returnDays: number;
  maintenance: boolean;
  logoText: string;
};

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions: string[];
};

export type CustomerGroup = {
  id: string;
  name: string;
  discountPercent: number;
  benefits: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  sku: string;
  delta: number;
  reason: string;
  at: string;
  actor: string;
};

export type NotificationTemplate = {
  id: string;
  event: string;
  subject: string;
  body: string;
  enabled: boolean;
};

export type SearchLog = {
  query: string;
  count: number;
  results: number;
};

export type AdminOps = {
  categories: CategoryRecord[];
  brands: BrandRecord[];
  attributes: AttributeRecord[];
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  pages: CmsPage[];
  menus: MenuItem[];
  banners: Banner[];
  homepageSections: HomepageSection[];
  settings: StoreSettings;
  adminUsers: AdminAccount[];
  groups: CustomerGroup[];
  stockMoves: StockMovement[];
  notifications: NotificationTemplate[];
  searches: SearchLog[];
};

export function seedAdminOps(): AdminOps {
  return {
    categories: [
      { id: "cat-rings", name: "Rings", slug: "rings", description: "Solitaires, bands and signets.", image: "/products/ring-1.jpg", banner: "/products/ring-5.jpg", order: 1, enabled: true, showInMenu: true, seoTitle: "Rings | Avyora", seoDescription: "Hallmarked rings." },
      { id: "cat-necklaces", name: "Necklaces", slug: "necklaces", description: "Collars, tennis lines and layering sets.", image: "/products/necklace-1.jpg", banner: "/products/necklace-2.jpg", order: 2, enabled: true, showInMenu: true, seoTitle: "Necklaces | Avyora", seoDescription: "Gold and diamond necklaces." },
      { id: "cat-earrings", name: "Earrings", slug: "earrings", description: "Drops, studs and hoops.", image: "/products/earring-1.jpg", banner: "/products/earring-2.jpg", order: 3, enabled: true, showInMenu: true, seoTitle: "Earrings | Avyora", seoDescription: "Everyday and evening earrings." },
      { id: "cat-bracelets", name: "Bracelets", slug: "bracelets", description: "Chains, tennis and cuffs.", image: "/products/bracelet-1.jpg", banner: "/products/bracelet-2.jpg", order: 4, enabled: true, showInMenu: true, seoTitle: "Bracelets | Avyora", seoDescription: "Bracelets in gold, silver and platinum." },
      { id: "cat-pendants", name: "Pendants", slug: "pendants", description: "Talismans and initials.", image: "/products/pendant-1.jpg", banner: "/products/pendant-2.jpg", order: 5, enabled: true, showInMenu: true, seoTitle: "Pendants | Avyora", seoDescription: "Pendants and charms." },
    ],
    brands: [
      { id: "br-avyora", name: "Avyora", slug: "avyora", logo: "/products/necklace-1.jpg", description: "The maison brand. Hallmarked jewellery from Bengaluru.", enabled: true, seoTitle: "Avyora", seoDescription: "Avyora jewellery." },
    ],
    attributes: [
      { id: "attr-size", name: "Size", values: ["12", "14", "16", "18", "20", "S", "M"] },
      { id: "attr-metal", name: "Metal", values: ["Gold", "Silver", "Platinum"] },
      { id: "attr-colour", name: "Colour", values: ["Yellow", "White", "Rose"] },
      { id: "attr-purity", name: "Purity", values: ["14KT", "18KT", "925", "950"] },
    ],
    shippingMethods: [
      { id: "ship-std", name: "Insured standard", carrier: "Delhivery", charge: 199, freeAbove: 7999, eta: "3–7 working days", zones: "Pan India", enabled: true },
      { id: "ship-exp", name: "Express metro", carrier: "Blue Dart", charge: 499, freeAbove: 25000, eta: "1–3 working days", zones: "Metro cities", enabled: true },
    ],
    paymentMethods: [
      { id: "pay-razorpay", name: "Razorpay (UPI, cards, netbanking)", details: "India-focused checkout. Server-side order + webhook in production.", enabled: true },
      { id: "pay-cod", name: "Cash on delivery", details: "Disabled by default for jewellery.", enabled: false },
    ],
    pages: [
      { slug: "about", title: "The atelier", body: "Avyora is a Bengaluru jewellery house built around proportion, hallmarking and a calm client experience.", published: true, seoTitle: "About Avyora", seoDescription: "The Avyora maison." },
      { slug: "contact", title: "Contact", body: "Email atelier@avyora.com or call +91 80 4120 8800. Atelier visits by appointment at 12 Walton Road, Bengaluru.", published: true, seoTitle: "Contact", seoDescription: "Contact Avyora." },
      { slug: "privacy", title: "Privacy", body: "We collect only what is required to fulfil orders, prevent fraud and improve the atelier.", published: true, seoTitle: "Privacy", seoDescription: "Privacy policy." },
      { slug: "terms", title: "Terms", body: "Orders are a contract for hallmarked jewellery as described on the product page. Custom pieces are final sale.", published: true, seoTitle: "Terms", seoDescription: "Terms and conditions." },
      { slug: "returns", title: "Returns & refunds", body: "15-day exchange on unworn pieces with tags and certificate. Prepaid refunds in 5–7 working days after QC.", published: true, seoTitle: "Returns", seoDescription: "Returns and refunds." },
      { slug: "shipping", title: "Shipping", body: "Complimentary insured shipping above ₹7,999. Standard 3–7 working days.", published: true, seoTitle: "Shipping", seoDescription: "Shipping policy." },
      { slug: "faq", title: "FAQ", body: "Gold and silver carry BIS hallmarking. Most rings can be resized once within 30 days.", published: true, seoTitle: "FAQ", seoDescription: "Questions." },
    ],
    menus: [
      { id: "m1", label: "Shop", href: "/shop", location: "header", order: 1, enabled: true },
      { id: "m2", label: "Atelier", href: "/collections/atelier", location: "header", order: 2, enabled: true },
      { id: "m3", label: "Celeste", href: "/collections/celeste", location: "header", order: 3, enabled: true },
      { id: "m4", label: "Flora", href: "/collections/flora", location: "header", order: 4, enabled: true },
      { id: "m5", label: "Maison", href: "/about", location: "header", order: 5, enabled: true },
      { id: "f1", label: "About", href: "/about", location: "footer", order: 1, enabled: true },
      { id: "f2", label: "Care", href: "/care", location: "footer", order: 2, enabled: true },
      { id: "f3", label: "FAQ", href: "/faq", location: "footer", order: 3, enabled: true },
      { id: "f4", label: "Shipping", href: "/policies/shipping", location: "footer", order: 4, enabled: true },
      { id: "f5", label: "Returns", href: "/policies/returns", location: "footer", order: 5, enabled: true },
      { id: "f6", label: "Privacy", href: "/policies/privacy", location: "footer", order: 6, enabled: true },
    ],
    banners: [
      { id: "ban-hero", title: "Light, held in gold.", description: "Hallmarked metals and certified stones for a lifetime of wear.", image: "/products/necklace-1.jpg", href: "/shop", cta: "Shop the collection", placement: "hero", device: "all", enabled: true, order: 1 },
      { id: "ban-promo", title: "The Quiet Bridal Edit", description: "Solitaires, halos and tennis lines. Complimentary resizing within 30 days.", image: "/products/life-1.jpg", href: "/shop?tag=bridal", cta: "Explore bridal", placement: "promo", device: "all", enabled: true, order: 2 },
    ],
    homepageSections: [
      { id: "hero", title: "Hero banner", enabled: true, order: 1 },
      { id: "collections", title: "Collections", enabled: true, order: 2 },
      { id: "bestsellers", title: "Bestsellers", enabled: true, order: 3 },
      { id: "campaign", title: "Promotional campaign", enabled: true, order: 4 },
      { id: "arrivals", title: "New arrivals", enabled: true, order: 5 },
      { id: "trust", title: "Trust strip", enabled: true, order: 6 },
      { id: "featured", title: "Editor selection", enabled: true, order: 7 },
    ],
    settings: {
      name: "Avyora",
      tagline: "Jewellery, composed.",
      email: "atelier@avyora.com",
      phone: "+91 80 4120 8800",
      address: "12, Walton Road, Bengaluru 560001",
      hours: "Tue–Sun, 11:00–19:00",
      currency: "INR",
      taxPercent: 3,
      freeShippingMin: 7999,
      returnDays: 15,
      maintenance: false,
      logoText: "AVYORA",
    },
    adminUsers: [
      { id: "admin", name: "Atelier Admin", email: "admin@avyora.com", role: "Super Admin", active: true, permissions: ["*"] },
      { id: "catalog", name: "Catalog Manager", email: "catalog@avyora.com", role: "Catalog Manager", active: true, permissions: ["products", "inventory", "categories", "orders"] },
      { id: "orders", name: "Order Manager", email: "orders@avyora.com", role: "Order Manager", active: true, permissions: ["orders", "returns", "shipping", "customers"] },
    ],
    groups: [
      { id: "g-regular", name: "Regular", discountPercent: 0, benefits: "Standard checkout and 15-day exchange." },
      { id: "g-premium", name: "Premium", discountPercent: 5, benefits: "Priority resizing and atelier appointments." },
      { id: "g-vip", name: "VIP", discountPercent: 10, benefits: "Private viewing and complimentary cleaning." },
      { id: "g-wholesale", name: "Wholesale", discountPercent: 15, benefits: "Trade pricing on selected SKUs." },
    ],
    stockMoves: [],
    notifications: [
      { id: "n-order", event: "Order confirmation", subject: "Your Avyora order {{id}}", body: "Thank you. We have confirmed your order and reserved inventory.", enabled: true },
      { id: "n-pay", event: "Payment confirmation", subject: "Payment received", body: "We have verified your payment.", enabled: true },
      { id: "n-ship", event: "Shipment", subject: "Your piece is on its way", body: "Tracking {{tracking}} has been issued.", enabled: true },
      { id: "n-del", event: "Delivery", subject: "Delivered", body: "Your order has been delivered.", enabled: true },
      { id: "n-can", event: "Cancellation", subject: "Order cancelled", body: "The order has been cancelled as requested.", enabled: true },
      { id: "n-ret", event: "Return / refund", subject: "Return update", body: "Your return or refund has been updated.", enabled: true },
      { id: "n-promo", event: "Promotional", subject: "An offer from Avyora", body: "A campaign is now live in the atelier.", enabled: false },
    ],
    searches: [
      { query: "solitaire", count: 42, results: 2 },
      { query: "pearl", count: 18, results: 1 },
      { query: "platinum tennis", count: 9, results: 1 },
      { query: "anklet", count: 6, results: 0 },
    ],
  };
}
