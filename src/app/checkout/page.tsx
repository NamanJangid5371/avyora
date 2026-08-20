"use client";

import { formatINR } from "@/lib/format";
import { useCartTotals, useCustomerAddresses, useShopStore } from "@/store/shop-store";
import type { Address } from "@/store/shop-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const steps = ["Bag", "Delivery", "Payment"] as const;

const emptyForm = {
  name: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const cart = useShopStore((s) => s.cart);
  const user = useShopStore((s) => s.user);
  const login = useShopStore((s) => s.login);
  const placeOrder = useShopStore((s) => s.placeOrder);
  const saveAddress = useShopStore((s) => s.saveAddress);
  const savedAddresses = useCustomerAddresses();
  const totals = useCartTotals();
  const maintenance = useShopStore((s) => s.ops?.settings.maintenance);
  const router = useRouter();
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("new");
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [form, setForm] = useState({
    ...emptyForm,
    name: user?.name ?? "",
  });

  useEffect(() => {
    if (!cart.length) router.replace("/cart");
  }, [cart.length, router]);

  useEffect(() => {
    if (user?.role === "customer" && user.name && !form.name) {
      setForm((f) => ({ ...f, name: user.name }));
    }
  }, [user, form.name]);

  useEffect(() => {
    const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    if (user?.role === "customer" && def && selectedId === "new" && !form.line1) {
      setSelectedId(def.id);
      setForm({
        name: def.name,
        phone: def.phone,
        line1: def.line1,
        city: def.city,
        state: def.state,
        pincode: def.pincode,
      });
    }
  }, [user, savedAddresses, selectedId, form.line1]);

  function onCheckoutLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const err = login(loginEmail, loginPassword);
    if (err) {
      setLoginError(err);
      return;
    }
    const next = useShopStore.getState().user;
    if (next?.role !== "customer") {
      setLoginError("Use a customer account for checkout benefits.");
      useShopStore.getState().logout();
      return;
    }
    setShowLogin(false);
    setLoginPassword("");
  }

  function applySaved(addr: Address) {
    setSelectedId(addr.id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  }

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedId("new");
        setForm({ ...form, [key]: e.target.value });
      },
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (maintenance) {
      setError("Checkout is paused while the atelier is in maintenance.");
      return;
    }
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.pincode) {
      setError("Please complete delivery details.");
      return;
    }
    setPaying(true);
    await new Promise((r) => setTimeout(r, 900));
    const address: Address = {
      id: selectedId !== "new" ? selectedId : `addr-${Date.now()}`,
      ...form,
      state: form.state || "—",
    };
    // Saves only to the signed-in customer's profile (guests are not attached to anyone).
    saveAddress(address);
    const result = placeOrder(address);
    setPaying(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`/orders/${result.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="mb-10 flex flex-wrap items-center gap-3 text-[11px] tracking-[0.18em] uppercase">
        {steps.map((step, i) => (
          <span key={step} className="flex items-center gap-3">
            {i === 0 ? (
              <Link href="/cart" className="text-ink-soft transition hover:text-ink">
                {step}
              </Link>
            ) : (
              <span className={i >= 1 ? "text-ink" : "text-ink-soft"}>{step}</span>
            )}
            {i < steps.length - 1 && <span className="h-px w-8 bg-line" />}
          </span>
        ))}
      </div>

      <p className="section-kicker">Secure checkout</p>
      <h1 className="section-title">Delivery & payment</h1>
      <p className="prose-calm mt-3">
        {user?.role === "customer"
          ? "Signed in — delivery addresses are saved only to your account."
          : "Guest checkout — sign in to load saved addresses without leaving this page."}
      </p>

      {user?.role !== "customer" && (
        <div className="mt-8 border border-line bg-ivory/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">Returning client? Sign in to use saved addresses.</p>
            <button
              type="button"
              onClick={() => setShowLogin((v) => !v)}
              className="text-[11px] tracking-widest uppercase underline"
            >
              {showLogin ? "Hide" : "Sign in"}
            </button>
          </div>
          {showLogin && (
            <form onSubmit={onCheckoutLogin} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="border border-line bg-transparent px-3 py-2.5 text-sm"
              />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                minLength={8}
                className="border border-line bg-transparent px-3 py-2.5 text-sm"
              />
              {loginError && <p className="sm:col-span-2 text-sm text-red-800">{loginError}</p>}
              <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
                <button type="submit" className="btn-primary py-2">
                  Sign in & continue
                </button>
                <Link href="/login?next=/checkout&mode=up" className="text-xs underline text-ink-soft">
                  Create account
                </Link>
              </div>
            </form>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-12 grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-[11px] tracking-[0.18em] uppercase text-gold-deep">Delivery</p>

          {user?.role === "customer" && savedAddresses.length > 0 && (
            <div className="space-y-2 border border-line bg-ivory/60 p-4">
              <p className="text-xs text-ink-soft">Your saved addresses</p>
              {savedAddresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => applySaved(a)}
                  className={`block w-full border px-3 py-2 text-left text-sm transition ${
                    selectedId === a.id ? "border-ink bg-paper" : "border-line hover:border-ink"
                  }`}
                >
                  <span className="font-medium">{a.name}</span>
                  <span className="mt-0.5 block text-ink-soft">
                    {a.line1}, {a.city} {a.pincode}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSelectedId("new");
                  setForm({ ...emptyForm, name: user?.name ?? "" });
                }}
                className="text-[11px] tracking-widest uppercase underline"
              >
                Use a new address
              </button>
            </div>
          )}

          <input className="w-full border border-line bg-transparent px-4 py-3.5" placeholder="Full name" {...field("name")} />
          <input className="w-full border border-line bg-transparent px-4 py-3.5" placeholder="Phone" {...field("phone")} />
          <input className="w-full border border-line bg-transparent px-4 py-3.5" placeholder="Address" {...field("line1")} />
          <div className="grid grid-cols-2 gap-4">
            <input className="border border-line bg-transparent px-4 py-3.5" placeholder="City" {...field("city")} />
            <input className="border border-line bg-transparent px-4 py-3.5" placeholder="State" {...field("state")} />
          </div>
          <input className="w-full border border-line bg-transparent px-4 py-3.5" placeholder="PIN code" {...field("pincode")} />
          <p className="text-xs text-ink-soft">
            {user?.role === "customer"
              ? "This address will be saved only under your customer account."
              : "Guest checkout does not store a shared address book. Create an account to keep your own addresses."}
          </p>
        </div>

        <div className="border border-line bg-ivory/80 p-8 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] tracking-[0.18em] uppercase text-gold-deep">Payment</p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight">Pay {formatINR(totals.total)}</h2>
          <div className="gold-line mt-5" />
          <p className="mt-5 text-sm text-ink-soft">UPI · Cards · Netbanking via Razorpay (demo)</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-ink-soft">Subtotal</span>
              <span>{formatINR(totals.subtotal)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-soft">Discount</span>
              <span>{formatINR(totals.discount)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span>{totals.shipping ? formatINR(totals.shipping) : "Complimentary"}</span>
            </li>
            <li className="flex justify-between border-t border-line pt-3 font-medium">
              <span>Total</span>
              <span>{formatINR(totals.total)}</span>
            </li>
          </ul>
          {error && <p className="mt-4 text-sm text-red-800">{error}</p>}
          <button type="submit" disabled={paying || !cart.length || !!maintenance} className="btn-primary mt-8 w-full">
            {maintenance ? "Checkout paused" : paying ? "Verifying payment…" : "Pay with Razorpay"}
          </button>
        </div>
      </form>
    </div>
  );
}
