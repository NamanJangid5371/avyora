"use client";

import { formatINR } from "@/lib/format";
import { useShopStore } from "@/store/shop-store";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const decoded = decodeURIComponent(id);
  const customer = useShopStore((s) => s.customers.find((c) => c.id === decoded));
  const upsertCustomer = useShopStore((s) => s.upsertCustomer);
  const groups = useShopStore((s) => s.ops?.groups ?? []);
  const orders = useShopStore((s) => s.orders.filter((o) => o.customerEmail?.toLowerCase() === customer?.email.toLowerCase()));

  if (!customer) {
    return (
      <div>
        Customer not found.{" "}
        <Link href="/admin/customers" className="underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-medium tracking-tight">{customer.name}</h1>
      <p className="mt-2 text-sm text-ink-soft">{customer.email}</p>
      <div className="mt-6 grid gap-4">
        <label className="text-sm">
          Phone
          <input
            value={customer.phone ?? ""}
            onChange={(e) => upsertCustomer({ ...customer, phone: e.target.value })}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Status
          <select
            value={customer.status}
            onChange={(e) => upsertCustomer({ ...customer, status: e.target.value as "active" | "blocked" })}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>
        <label className="text-sm">
          Customer group
          <select
            value={customer.groupId ?? "g-regular"}
            onChange={(e) => upsertCustomer({ ...customer, groupId: e.target.value })}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Notes
          <textarea
            value={customer.notes ?? ""}
            onChange={(e) => upsertCustomer({ ...customer, notes: e.target.value })}
            className="mt-1 min-h-24 w-full border border-line bg-transparent px-3 py-2"
          />
        </label>
      </div>
      <h2 className="mt-10 text-lg font-medium">Orders</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/admin/orders/${o.id}`} className="underline">
              {o.id}
            </Link>{" "}
            · {o.status} · {formatINR(o.total)}
          </li>
        ))}
        {!orders.length && <li className="text-ink-soft">No linked orders.</li>}
      </ul>
    </div>
  );
}
