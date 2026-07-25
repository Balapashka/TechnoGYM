/**
 * Per-collection accent tint. Used to colour product card backgrounds and
 * tiles so the shop reads as varied collections instead of one grey grid.
 * Keys match the seeded category slugs; unknown slugs fall back to a neutral.
 */
const COLORS: Record<string, string> = {
  treadmills: "bg-sky-100",
  bikes: "bg-amber-100",
  ellipticals: "bg-emerald-100",
  rowers: "bg-cyan-100",
  strength: "bg-rose-100",
  "free-weights": "bg-orange-100",
  benches: "bg-lime-100",
  racks: "bg-zinc-200",
  "cardio-accessories": "bg-violet-100",
  recovery: "bg-teal-100",
};

export function categoryColor(slug: string): string {
  return COLORS[slug] ?? "bg-mist";
}
