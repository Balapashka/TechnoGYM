"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

/** Quote request as serialized by the admin page for the client table. */
export type QuoteRequestRow = {
  id: string;
  /** Null once the product is deleted — the name snapshot still stands. */
  productId: string | null;
  productName: string;
  name: string;
  phone: string;
  email: string | null;
  comment: string | null;
  status: string;
  /** Pre-formatted on the server so the list matches the rendered HTML. */
  createdAtLabel: string;
};

const statusStyle: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  CLOSED: "bg-mist text-ink-soft",
};

/**
 * Price requests left on made-to-order products. Client-side so the column
 * labels follow the language switch; the page itself stays a server component
 * that owns the Prisma query.
 */
export function QuoteRequestsTable({ rows }: { rows: QuoteRequestRow[] }) {
  const t = useTranslation();

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone p-10 text-center">
        <p className="text-ink-soft">{t("admin.quoteNoRequests")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">{t("admin.quoteDate")}</th>
              <th className="px-4 py-3">{t("admin.quoteProduct")}</th>
              <th className="px-4 py-3">{t("admin.quoteContact")}</th>
              <th className="px-4 py-3">{t("product.requestComment")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-stone align-top transition hover:bg-mist">
                <td className="px-4 py-3">
                  <span className="whitespace-nowrap text-ink-soft">
                    {row.createdAtLabel}
                  </span>
                  <span
                    className={`mt-1 block w-fit rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                      statusStyle[row.status] ?? "bg-mist text-ink"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {row.productId ? (
                    <Link
                      href={`/admin/products/${row.productId}/edit`}
                      className="underline hover:text-ink-soft"
                    >
                      {row.productName}
                    </Link>
                  ) : (
                    row.productName
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="block font-semibold">{row.name}</span>
                  <a
                    href={`tel:${row.phone.replace(/[^\d+]/g, "")}`}
                    className="block whitespace-nowrap underline hover:text-ink-soft"
                  >
                    {row.phone}
                  </a>
                  {row.email && (
                    <a
                      href={`mailto:${row.email}`}
                      className="block break-all text-ink-soft underline hover:text-ink"
                    >
                      {row.email}
                    </a>
                  )}
                </td>
                <td className="max-w-xs px-4 py-3 text-ink-soft">
                  {row.comment ? (
                    <span className="whitespace-pre-line">{row.comment}</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
