"use client";

import { STOREFRONT_ORIGIN } from "@/lib/host";
import { useShopStore } from "@/store/shop-store";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function StaffLoginPage() {
  const staffLogin = useShopStore((s) => s.staffLogin);
  const logout = useShopStore((s) => s.logout);
  const user = useShopStore((s) => s.user);
  const hydrated = useShopStore((s) => s.hydrated);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (!hydrated || redirected.current) return;
    if (user && user.role !== "admin") {
      logout();
      return;
    }
    if (user?.role === "admin") {
      redirected.current = true;
      router.replace("/admin");
    }
  }, [user, hydrated, router, logout]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    const err = staffLogin(email, password);
    if (err) {
      setError(err);
      setBusy(false);
      return;
    }
    redirected.current = true;
    router.replace("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#12100e] text-ivory">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <p className="font-serif text-3xl tracking-[0.18em]">AVYORA</p>
        <p className="mt-2 text-[11px] tracking-[0.22em] uppercase text-[#c4a574]">Staff portal</p>
        <h1 className="mt-8 text-3xl font-medium tracking-tight">Atelier sign in</h1>
        <p className="mt-3 text-sm text-ivory/55">
          Staff accounts only. Customer accounts use the storefront sign-in on port 3000.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <label className="block text-sm text-ivory/70">
            Staff email
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@avyora.com"
              className="mt-1.5 w-full border border-white/15 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/35"
            />
          </label>
          <label className="block text-sm text-ivory/70">
            Password
            <div className="relative mt-1.5">
              <input
                required
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                minLength={4}
                className="w-full border border-white/15 bg-transparent px-4 py-3 pr-16 text-ivory placeholder:text-ivory/35"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-widest uppercase text-ivory/45 hover:text-ivory"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {error && <p className="text-sm text-[#e8b4a0]">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#c4a574] px-4 py-3 text-[11px] tracking-[0.2em] uppercase text-[#12100e] transition hover:bg-[#d4b88a] disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Enter admin"}
          </button>
        </form>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-ivory/45">
          <p>
            Demo staff IDs — password <span className="text-ivory/80">avyora123</span>
          </p>
          <ul className="mt-3 space-y-1 text-ivory/70">
            <li>admin@avyora.com — Super Admin</li>
            <li>catalog@avyora.com — Catalog Manager</li>
            <li>orders@avyora.com — Order Manager</li>
          </ul>
          <a href={STOREFRONT_ORIGIN} className="mt-6 inline-block underline underline-offset-4 hover:text-ivory">
            Back to storefront (customer login)
          </a>
        </div>
      </div>
    </div>
  );
}
