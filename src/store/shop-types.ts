export type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type NotificationPrefs = {
  orders: boolean;
  marketing: boolean;
  security: boolean;
};

export type CartItem = {
  productId: string;
  sku: string;
  quantity: number;
};

export type OrderStatus =
  | "Pending Payment"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Return Requested"
  | "Refunded";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: {
    productId: string;
    sku: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  address: Address;
  paymentId: string;
  trackingId?: string;
  notes?: string;
  refundedAmount?: number;
  customerEmail?: string;
  paymentStatus?: "Success" | "Pending" | "Failed" | "Cancelled" | "Refunded";
  paymentMethod?: string;
  tax?: number;
  cancelReason?: string;
  returnReason?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  /** Demo-only credential for storefront sign-in */
  password?: string;
  createdAt: string;
  status: "active" | "blocked";
  notes?: string;
  groupId?: string;
  /** Saved delivery addresses for this customer only */
  addresses?: Address[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  resetToken?: string;
  resetExpiresAt?: string;
  notifications?: NotificationPrefs;
  failedLogins?: number;
  lockUntil?: string;
};

export type Campaign = {
  id: string;
  title: string;
  body: string;
  image: string;
  href: string;
  active: boolean;
  type?: "seasonal" | "flash" | "product" | "category" | "bogo";
  startsAt?: string;
  endsAt?: string;
  productSlugs?: string[];
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
};

export type WishlistItem = string;
