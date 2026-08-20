"use client";

import { displayPrice } from "@/data/catalog";
import { ProductImage } from "@/components/product-image";
import { useToast } from "@/components/toast";
import { formatINR } from "@/lib/format";
import { downloadOrderInvoicePdf, ORDER_FLOW, orderStatusStep } from "@/lib/invoice-pdf";
import { useCustomerAddresses, useLiveCatalog, useShopStore } from "@/store/shop-store";
import type { Address } from "@/store/shop-types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "wishlist", label: "Wishlist" },
  { id: "returns", label: "Returns & refunds" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const emptyAddr = {
  name: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

function AccountInner() {
  const user = useShopStore((s) => s.user);
  const orders = useShopStore((s) => s.orders);
  const customers = useShopStore((s) => s.customers);
  const wishlistIds = useShopStore((s) => s.wishlist);
  const addresses = useCustomerAddresses();
  const { products } = useLiveCatalog();
  const logout = useShopStore((s) => s.logout);
  const upsertCustomer = useShopStore((s) => s.upsertCustomer);
  const removeAddress = useShopStore((s) => s.removeAddress);
  const saveAddress = useShopStore((s) => s.saveAddress);
  const setDefaultAddress = useShopStore((s) => s.setDefaultAddress);
  const changePassword = useShopStore((s) => s.changePassword);
  const resendVerification = useShopStore((s) => s.resendVerification);
  const verifyEmail = useShopStore((s) => s.verifyEmail);
  const updateNotifications = useShopStore((s) => s.updateNotifications);
  const addToCart = useShopStore((s) => s.addToCart);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const { toast } = useToast();
  const router = useRouter();
  const search = useSearchParams();

  const sectionParam = search.get("section") as SectionId | null;
  const [section, setSection] = useState<SectionId>(
    sectionParam && SECTIONS.some((s) => s.id === sectionParam) ? sectionParam : "overview",
  );

  const customer = useMemo(
    () => customers.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()),
    [customers, user?.email],
  );

  const myOrders = useMemo(() => {
    if (!user) return [];
    return orders
      .filter((o) => o.customerEmail?.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, user]);

  const returns = useMemo(
    () => myOrders.filter((o) => o.status === "Return Requested" || o.status === "Refunded"),
    [myOrders],
  );

  const wishlist = useMemo(() => {
    return wishlistIds.map((id) => {
      const product = products.find((p) => p.id === id);
      return { id, product };
    });
  }, [wishlistIds, products]);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [addrForm, setAddrForm] = useState(emptyAddr);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addrMsg, setAddrMsg] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [securityMsg, setSecurityMsg] = useState("");
  const [securityErr, setSecurityErr] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");

  useEffect(() => {
    if (!user) router.replace("/login?next=/account");
  }, [user, router]);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(customer?.phone ?? "");
  }, [user?.name, customer?.phone]);

  useEffect(() => {
    if (search.get("welcome") === "1") setWelcome(true);
    const s = search.get("section") as SectionId | null;
    if (s && SECTIONS.some((x) => x.id === s)) setSection(s);
  }, [search]);

  if (!user) return null;

  function go(id: SectionId) {
    setSection(id);
    router.replace(`/account?section=${id}`, { scroll: false });
  }

  function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    const base = customer ?? {
      id: user!.id.startsWith("c-") ? user!.id : `c-${user!.email.toLowerCase()}`,
      email: user!.email,
      createdAt: new Date().toISOString(),
      status: "active" as const,
      addresses: [] as Address[],
    };
    upsertCustomer({
      ...base,
      name: name.trim() || user!.name,
      phone: phone.trim() || undefined,
      addresses: base.addresses ?? customer?.addresses ?? [],
    });
    useShopStore.setState({
      user: { ...user!, name: name.trim() || user!.name },
    });
    setSaved(true);
    toast("Profile saved");
    window.setTimeout(() => setSaved(false), 2000);
  }

  function onSaveAddress(e: FormEvent) {
    e.preventDefault();
    if (!addrForm.name || !addrForm.phone || !addrForm.line1 || !addrForm.city || !addrForm.pincode) {
      setAddrMsg("Please complete all required address fields.");
      return;
    }
    saveAddress({
      id: editingId ?? `addr-${Date.now()}`,
      ...addrForm,
      state: addrForm.state || "—",
      isDefault: editingId
        ? addresses.find((a) => a.id === editingId)?.isDefault
        : addresses.length === 0,
    });
    setAddrForm(emptyAddr);
    setEditingId(null);
    setAddrMsg(editingId ? "Address updated." : "Address saved to your account.");
    toast(editingId ? "Address updated" : "Address saved");
    window.setTimeout(() => setAddrMsg(""), 2000);
  }

  function startEdit(a: Address) {
    setEditingId(a.id);
    setAddrForm({
      name: a.name,
      phone: a.phone,
      line1: a.line1,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    });
    setSection("addresses");
  }

  function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setSecurityErr("");
    setSecurityMsg("");
    if (newPw !== confirmPw) {
      setSecurityErr("New passwords do not match.");
      return;
    }
    const err = changePassword(currentPw, newPw);
    if (err) {
      setSecurityErr(err);
      return;
    }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setSecurityMsg("Password updated. Keep this change private.");
    toast("Password changed");
  }

  function onLogout() {
    logout();
    toast("Signed out");
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">My account</p>
          <h1 className="section-title">Hello, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Manage your profile, orders, addresses, wishlist, and security.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-[11px] tracking-widest uppercase text-ink-soft transition hover:text-ink"
        >
          Sign out
        </button>
      </div>

      {welcome && (
        <div className="mt-6 border border-line bg-ivory/80 px-5 py-4 text-sm">
          Account created. You can continue shopping anytime — your bag and wishlist stay with this browser.
          <button type="button" className="ml-3 underline" onClick={() => setWelcome(false)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Account">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(s.id)}
              className={`whitespace-nowrap border px-3 py-2 text-left text-[11px] tracking-[0.14em] uppercase transition ${
                section === s.id ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onLogout}
            className="hidden whitespace-nowrap border border-line px-3 py-2 text-left text-[11px] tracking-[0.14em] uppercase text-ink-soft hover:border-ink hover:text-ink lg:block"
          >
            Logout
          </button>
        </nav>

        <div>
          {section === "overview" && (
            <section>
              <h2 className="font-serif text-3xl tracking-tight">Account summary</h2>
              <div className="gold-line mt-4" />
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <button type="button" onClick={() => go("orders")} className="border border-line bg-paper/50 p-5 text-left">
                  <p className="text-[11px] tracking-widest uppercase text-gold-deep">Orders</p>
                  <p className="mt-2 font-serif text-3xl">{myOrders.length}</p>
                </button>
                <button type="button" onClick={() => go("addresses")} className="border border-line bg-paper/50 p-5 text-left">
                  <p className="text-[11px] tracking-widest uppercase text-gold-deep">Addresses</p>
                  <p className="mt-2 font-serif text-3xl">{addresses.length}</p>
                </button>
                <button type="button" onClick={() => go("wishlist")} className="border border-line bg-paper/50 p-5 text-left">
                  <p className="text-[11px] tracking-widest uppercase text-gold-deep">Wishlist</p>
                  <p className="mt-2 font-serif text-3xl">{wishlistIds.length}</p>
                </button>
              </div>
              <div className="mt-8">
                <h3 className="text-sm font-medium tracking-widest uppercase text-gold-deep">Recent orders</h3>
                {!myOrders.length ? (
                  <p className="mt-3 text-sm text-ink-soft">No orders yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {myOrders.slice(0, 3).map((o) => (
                      <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 border border-line px-4 py-3 text-sm">
                        <Link href={`/orders/${o.id}`} className="font-medium hover:text-gold-deep">
                          {o.id}
                        </Link>
                        <span className="text-ink-soft">{o.status}</span>
                        <span>{formatINR(o.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-6 text-sm text-ink-soft">
                Email verification:{" "}
                <span className="text-ink">{customer?.emailVerified ? "Verified" : "Pending"}</span>
                {!customer?.emailVerified && (
                  <button
                    type="button"
                    className="ml-3 underline"
                    onClick={() => {
                      const err = resendVerification();
                      if (err) setVerifyMsg(err);
                      else {
                        verifyEmail();
                        setVerifyMsg("Email verified (demo).");
                        toast("Email verified");
                      }
                    }}
                  >
                    Verify now
                  </button>
                )}
              </p>
              {verifyMsg && <p className="mt-2 text-xs text-ink-soft">{verifyMsg}</p>}
            </section>
          )}

          {section === "profile" && (
            <section className="border border-line bg-ivory/70 p-6 shadow-[var(--shadow-soft)]">
              <h2 className="font-serif text-3xl tracking-tight">Profile</h2>
              <div className="gold-line mt-4" />
              <form onSubmit={onSaveProfile} className="mt-6 max-w-md space-y-4">
                <label className="block text-sm">
                  Full name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2.5"
                  />
                </label>
                <label className="block text-sm">
                  Email
                  <input
                    value={user.email}
                    readOnly
                    className="mt-1 w-full border border-line bg-paper/60 px-3 py-2.5 text-ink-soft"
                  />
                  <span className="mt-1 block text-xs text-ink-soft">
                    {customer?.emailVerified ? "Verified" : "Not verified"} — contact care to change email.
                  </span>
                </label>
                <label className="block text-sm">
                  Phone
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 …"
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2.5"
                  />
                </label>
                <button type="submit" className="btn-primary">
                  {saved ? "Saved" : "Save changes"}
                </button>
              </form>
            </section>
          )}

          {section === "orders" && (
            <section>
              <h2 className="font-serif text-3xl tracking-tight">Orders</h2>
              <div className="gold-line mt-4" />
              {!myOrders.length ? (
                <div className="mt-8 border border-line p-8 text-center">
                  <p className="text-sm text-ink-soft">No orders yet for this account.</p>
                  <Link href="/shop" className="btn-primary mt-6 inline-flex">
                    Browse jewellery
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {myOrders.map((o) => {
                    const step = orderStatusStep(o.status);
                    return (
                      <div key={o.id} className="border border-line bg-paper/40 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <Link href={`/orders/${o.id}`} className="text-lg font-medium tracking-tight hover:text-gold-deep">
                              {o.id}
                            </Link>
                            <p className="mt-1 text-sm text-ink-soft">
                              {new Date(o.createdAt).toLocaleString("en-IN")} · {o.items.length} item
                              {o.items.length === 1 ? "" : "s"}
                            </p>
                            {o.trackingId && (
                              <p className="mt-1 text-xs text-ink-soft">Tracking: {o.trackingId}</p>
                            )}
                            {o.paymentStatus && (
                              <p className="mt-1 text-xs text-ink-soft">Payment: {o.paymentStatus}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatINR(o.total)}</p>
                            <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-ink-soft">{o.status}</p>
                          </div>
                        </div>
                        {step >= 0 && (
                          <div className="mt-5 flex flex-wrap gap-1">
                            {ORDER_FLOW.map((s, i) => (
                              <span
                                key={s}
                                className={`px-2 py-1 text-[10px] tracking-[0.12em] uppercase ${
                                  i <= step ? "bg-ink text-ivory" : "border border-line text-ink-soft"
                                }`}
                              >
                                {s.replace("Pending Payment", "Payment")}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href={`/orders/${o.id}`}
                            className="border border-line px-4 py-2 text-[11px] tracking-widest uppercase transition hover:border-ink"
                          >
                            View details
                          </Link>
                          <button
                            type="button"
                            onClick={() => downloadOrderInvoicePdf(o, name || user.name)}
                            className="btn-primary py-2"
                          >
                            Download invoice
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {section === "addresses" && (
            <section>
              <h2 className="font-serif text-3xl tracking-tight">Addresses</h2>
              <p className="mt-2 text-sm text-ink-soft">Saved only to your account — used at checkout when signed in.</p>
              <div className="gold-line mt-4" />
              <div className="mt-6 space-y-3">
                {!addresses.length && <p className="text-sm text-ink-soft">No addresses yet. Add one below.</p>}
                {addresses.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 border border-line bg-paper/50 p-4">
                    <div>
                      <p className="font-medium">
                        {a.name}
                        {a.isDefault && (
                          <span className="ml-2 text-[10px] tracking-widest uppercase text-gold-deep">Default</span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}
                        <br />
                        {a.city}, {a.state} {a.pincode}
                        <br />
                        {a.phone}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!a.isDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            setDefaultAddress(a.id);
                            toast("Default address updated");
                          }}
                          className="text-[10px] tracking-widest uppercase text-ink-soft hover:text-ink"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(a)}
                        className="text-[10px] tracking-widest uppercase text-ink-soft hover:text-ink"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeAddress(a.id);
                          toast("Address removed");
                        }}
                        className="text-[10px] tracking-widest uppercase text-ink-soft hover:text-ink"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={onSaveAddress} className="mt-8 max-w-lg space-y-3 border-t border-line pt-6">
                <p className="text-[11px] tracking-[0.16em] uppercase text-gold-deep">
                  {editingId ? "Edit address" : "Add address"}
                </p>
                <input
                  value={addrForm.name}
                  onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full border border-line bg-transparent px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full border border-line bg-transparent px-3 py-2 text-sm"
                />
                <input
                  value={addrForm.line1}
                  onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                  placeholder="Address line"
                  className="w-full border border-line bg-transparent px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    placeholder="City"
                    className="border border-line bg-transparent px-3 py-2 text-sm"
                  />
                  <input
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    placeholder="State"
                    className="border border-line bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <input
                  value={addrForm.pincode}
                  onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                  placeholder="PIN code"
                  className="w-full border border-line bg-transparent px-3 py-2 text-sm"
                />
                {addrMsg && <p className="text-xs text-ink-soft">{addrMsg}</p>}
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="btn-primary">
                    {editingId ? "Update address" : "Save address"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setAddrForm(emptyAddr);
                      }}
                      className="text-[11px] tracking-widest uppercase underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          {section === "wishlist" && (
            <section>
              <h2 className="font-serif text-3xl tracking-tight">Wishlist</h2>
              <div className="gold-line mt-4" />
              {!wishlist.length ? (
                <div className="mt-8">
                  <p className="text-sm text-ink-soft">No saved pieces yet.</p>
                  <Link href="/shop" className="btn-primary mt-6 inline-flex">
                    Browse jewellery
                  </Link>
                </div>
              ) : (
                <ul className="mt-6 space-y-4">
                  {wishlist.map(({ id, product }) => {
                    if (!product) {
                      return (
                        <li key={id} className="flex items-center justify-between border border-line px-4 py-3 text-sm">
                          <span className="text-ink-soft">This piece is no longer available.</span>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(id)}
                            className="text-[10px] tracking-widest uppercase underline"
                          >
                            Remove
                          </button>
                        </li>
                      );
                    }
                    const price = displayPrice(product);
                    const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
                    const available = variant && variant.stock > 0;
                    return (
                      <li key={id} className="flex flex-wrap items-center gap-4 border border-line p-4">
                        <div className="relative h-20 w-16 overflow-hidden bg-ivory">
                          <ProductImage src={product.images[0]} alt={product.name} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/product/${product.slug}`} className="font-medium hover:text-gold-deep">
                            {product.name}
                          </Link>
                          <p className="mt-1 text-sm text-ink-soft">
                            {formatINR(price.from)}
                            {!available && <span className="ml-2 text-red-800">Unavailable</span>}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {available && (
                            <button
                              type="button"
                              onClick={() => {
                                addToCart(product.id, variant.sku, 1);
                                toast("Moved to bag");
                              }}
                              className="btn-primary py-2"
                            >
                              Move to bag
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              toggleWishlist(id);
                              toast("Removed from wishlist");
                            }}
                            className="border border-line px-3 py-2 text-[10px] tracking-widest uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link href="/wishlist" className="mt-6 inline-block text-xs tracking-[0.16em] uppercase underline">
                Open full wishlist
              </Link>
            </section>
          )}

          {section === "returns" && (
            <section>
              <h2 className="font-serif text-3xl tracking-tight">Returns & refunds</h2>
              <div className="gold-line mt-4" />
              {!returns.length ? (
                <p className="mt-6 text-sm text-ink-soft">No return or refund activity yet.</p>
              ) : (
                <ul className="mt-6 space-y-3">
                  {returns.map((o) => (
                    <li key={o.id} className="border border-line px-4 py-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <Link href={`/orders/${o.id}`} className="font-medium hover:text-gold-deep">
                          {o.id}
                        </Link>
                        <span>{o.status}</span>
                      </div>
                      {o.refundedAmount != null && (
                        <p className="mt-1 text-ink-soft">Refunded {formatINR(o.refundedAmount)}</p>
                      )}
                      {o.returnReason && <p className="mt-1 text-ink-soft">{o.returnReason}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {section === "security" && (
            <section className="max-w-md">
              <h2 className="font-serif text-3xl tracking-tight">Security</h2>
              <p className="mt-2 text-sm text-ink-soft">Change your password. Passwords are never shown in plain text.</p>
              <div className="gold-line mt-4" />
              <form onSubmit={onChangePassword} className="mt-6 space-y-4">
                <label className="block text-sm">
                  Current password
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    required
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2.5"
                  />
                </label>
                <label className="block text-sm">
                  New password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                    minLength={8}
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2.5"
                  />
                </label>
                <label className="block text-sm">
                  Confirm new password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    required
                    minLength={8}
                    className="mt-1 w-full border border-line bg-transparent px-3 py-2.5"
                  />
                </label>
                <p className="text-xs text-ink-soft">At least 8 characters with a letter and a number.</p>
                {securityErr && <p className="text-sm text-red-800">{securityErr}</p>}
                {securityMsg && <p className="text-sm text-ink-soft">{securityMsg}</p>}
                <button type="submit" className="btn-primary">
                  Update password
                </button>
              </form>
            </section>
          )}

          {section === "notifications" && (
            <section className="max-w-md">
              <h2 className="font-serif text-3xl tracking-tight">Notifications</h2>
              <p className="mt-2 text-sm text-ink-soft">Choose which messages you receive.</p>
              <div className="gold-line mt-4" />
              <div className="mt-6 space-y-4 text-sm">
                {(
                  [
                    ["orders", "Order updates"],
                    ["security", "Security alerts"],
                    ["marketing", "Offers & atelier news"],
                  ] as const
                ).map(([key, label]) => {
                  const checked =
                    key === "orders"
                      ? customer?.notifications?.orders ?? true
                      : key === "security"
                        ? customer?.notifications?.security ?? true
                        : customer?.notifications?.marketing ?? false;
                  return (
                    <label key={key} className="flex items-center justify-between gap-4 border border-line px-4 py-3">
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          updateNotifications({ [key]: e.target.checked });
                          toast("Preferences saved");
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-ink-soft">Loading account…</div>}>
      <AccountInner />
    </Suspense>
  );
}
