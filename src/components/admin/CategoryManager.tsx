"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { field } from "@/components/auth/AuthCard";

type Cat = { id: string; name: string; slug: string; count: number };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Inline CRUD for categories: add at top, rename or delete each row. */
export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setError(null);
    if (name.trim().length < 2) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug: slugify(name) }),
    });
    if (res.ok) {
      setName("");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not create category");
    }
  }

  async function rename(c: Cat) {
    const next = prompt("New name", c.name);
    if (!next || next.trim().length < 2) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: next.trim(), slug: slugify(next) }),
    });
    if (res.ok) router.refresh();
    else alert((await res.json().catch(() => ({}))).error ?? "Failed");
  }

  async function remove(c: Cat) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
    else alert((await res.json().catch(() => ({}))).error ?? "Failed");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex gap-3">
        <input
          className={field}
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <button
          onClick={create}
          className="hover-lift whitespace-nowrap rounded-full bg-accent px-6 text-sm font-bold uppercase text-ink"
        >
          Add
        </button>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {categories.map((c) => (
            <motion.li
              key={c.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between rounded-xl border border-stone px-4 py-3"
            >
              <div>
                <span className="font-semibold">{c.name}</span>
                <span className="ml-2 text-xs text-ink-soft">
                  /{c.slug} · {c.count} products
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => rename(c)}
                  className="font-bold underline hover:text-ink-soft"
                >
                  Rename
                </button>
                <button
                  onClick={() => remove(c)}
                  className="font-bold text-red-600 underline"
                >
                  Delete
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
