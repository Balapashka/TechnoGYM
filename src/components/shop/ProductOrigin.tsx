/**
 * Manufacturer + country of origin line shown on product cards and details.
 * Both fields are optional in the data model, so each part renders only when
 * it is present.
 */
export function ProductOrigin({
  brand,
  originCountry,
  className = "",
}: {
  brand: string;
  originCountry: string;
  className?: string;
}) {
  if (!brand && !originCountry) return null;

  return (
    <p
      className={`flex flex-wrap items-center gap-x-2 text-[11px] font-bold uppercase tracking-widest text-ink-soft ${className}`}
    >
      {brand && <span className="text-ink">{brand}</span>}
      {brand && originCountry && <span aria-hidden="true">·</span>}
      {originCountry && <span>{originCountry}</span>}
    </p>
  );
}
