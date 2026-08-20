"use client";

import type { Collection } from "@/data/types";
import { MEDIA_LIBRARY, slugify } from "@/lib/media";
import { useShopStore } from "@/store/shop-store";
import { FormEvent, useState } from "react";

export default function CollectionsAdmin() {
  const collections = useShopStore((s) => s.collections);
  const catalog = useShopStore((s) => s.catalog);
  const upsertCollection = useShopStore((s) => s.upsertCollection);
  const deleteCollection = useShopStore((s) => s.deleteCollection);
  const [form, setForm] = useState<Collection>({
    slug: "",
    name: "",
    tagline: "",
    description: "",
    image: MEDIA_LIBRARY[6],
    productSlugs: [],
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const slug = form.slug || slugify(form.name);
    upsertCollection({ ...form, slug });
    setForm({ slug: "", name: "", tagline: "", description: "", image: MEDIA_LIBRARY[6], productSlugs: [] });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">Collections</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
            className="w-full border border-line bg-transparent px-3 py-2"
          />
          <input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            className="w-full border border-line bg-transparent px-3 py-2"
          />
          <input
            placeholder="Tagline"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full border border-line bg-transparent px-3 py-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="min-h-24 w-full border border-line bg-transparent px-3 py-2"
          />
          <p className="text-xs uppercase tracking-widest text-ink-soft">Assign products</p>
          <div className="max-h-48 overflow-auto border border-line p-3 text-sm">
            {catalog.map((p) => (
              <label key={p.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={form.productSlugs.includes(p.slug)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      productSlugs: e.target.checked
                        ? [...form.productSlugs, p.slug]
                        : form.productSlugs.filter((s) => s !== p.slug),
                    })
                  }
                />
                {p.name}
              </label>
            ))}
          </div>
          <button className="bg-ink px-5 py-2 text-xs uppercase tracking-widest text-ivory">Save collection</button>
        </form>
      </div>
      <div className="space-y-4">
        {collections.map((c) => (
          <div key={c.slug} className="border border-line p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-ink-soft">
                  /{c.slug} · {c.productSlugs.length} pieces
                </p>
              </div>
              <div className="space-x-3 text-xs uppercase tracking-widest">
                <button onClick={() => setForm(c)}>Edit</button>
                <button onClick={() => deleteCollection(c.slug)}>Delete</button>
              </div>
            </div>
            <p className="mt-2 text-sm">{c.tagline}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
