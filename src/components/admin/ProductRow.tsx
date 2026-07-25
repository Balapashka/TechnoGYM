"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/format";

/** One product row in the admin table, with inline delete. */
export function ProductRow({
  id,
  name,
  category,
  priceCents,
  inStock,
}: {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  inStock: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`Delete "${name}"?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setBusy(false);
      alert("Could not delete the product");
    }
  }

  return (
    <tr className={`border-t border-stone transition hover:bg-mist ${busy ? "opacity-40" : ""}`}>
      <td className="px-4 py-3 font-semibold">{name}</td>
      <td className="px-4 py-3 text-ink-soft">{category}</td>
      <td className="px-4 py-3">{formatPrice(priceCents)}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
          }`}
        >
          {inStock ? "In stock" : "Out"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/products/${id}/edit`}
          className="font-bold underline hover:text-ink-soft"
        >
          Edit
        </Link>
        <button
          onClick={remove}
          disabled={busy}
          className="ml-4 font-bold text-red-600 underline hover:text-red-700"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
