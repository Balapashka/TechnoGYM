"use client";

import Link from "next/link";
import type { UseFormRegisterReturn } from "react-hook-form";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/cn";

/**
 * Personal-data consent checkbox (152-ФЗ). Every form that collects a name,
 * phone or email must carry one, unticked by default, with a link to the
 * privacy policy.
 */
export function Consent({
  registration,
  error,
  id,
  tone = "light",
  children,
}: {
  registration: UseFormRegisterReturn;
  /** Truthy when validation failed; the message is localized here. */
  error?: unknown;
  id: string;
  /** "dark" for use on the black footer. */
  tone?: "light" | "dark";
  /** Custom label; defaults to the privacy-policy consent text. */
  children?: React.ReactNode;
}) {
  const t = useTranslation();
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-2 text-xs leading-snug",
          tone === "dark" ? "text-white/70" : "text-ink-soft",
        )}
      >
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
          aria-invalid={error ? true : undefined}
          {...registration}
        />
        <span>
          {children ?? (
            <>
              {t("legal.consentPrefix")}{" "}
              <Link
                href="/privacy"
                target="_blank"
                className={cn(
                  "underline",
                  tone === "dark" ? "hover:text-accent" : "hover:text-ink",
                )}
              >
                {t("legal.privacyLink")}
              </Link>
            </>
          )}
        </span>
      </label>
      {Boolean(error) && (
        <p
          className={cn(
            "mt-1 text-xs",
            tone === "dark" ? "text-accent" : "text-red-600",
          )}
        >
          {t("legal.consentRequired")}
        </p>
      )}
    </div>
  );
}
