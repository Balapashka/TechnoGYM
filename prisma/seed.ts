import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PRODUCT_IMG = "/placeholders/product-1000x1000.svg";
const GALLERY_IMG = "/placeholders/gallery-1600x1200.svg";

/**
 * Procedural catalog generator.
 * 12 themed categories; each gets ~20 products built by combining a "line"
 * name with a tier. Names, copy and prices are all generated for the demo —
 * nothing here is real product data.
 */

type CategorySeed = {
  slug: string;
  name: string;
  noun: string; // singular product noun, e.g. "Treadmill"
  lines: string[]; // model-line names
  features: string[]; // pool of feature bullets
  basePrice: number; // base price in euros for tier ramp
};

const categories: CategorySeed[] = [
  {
    slug: "treadmills",
    name: "Treadmills",
    noun: "Treadmill",
    lines: ["Runner", "Stride", "Velocity", "Pace", "Trail", "Sprint", "Endurance", "Glide", "Pulse", "Summit"],
    features: ["Cushioned deck", "Quiet drive belt", "Incline control", "Bluetooth ready", "Foldable frame", "Heart-rate grips", '22" touch display'],
    basePrice: 1900,
  },
  {
    slug: "bikes",
    name: "Indoor Bikes",
    noun: "Bike",
    lines: ["Aero", "Spin", "Circuit", "Rev", "Cadence", "Drift", "Pursuit", "Vortex", "Apex", "Tempo"],
    features: ["Magnetic resistance", "Adjustable position", "Connected metrics", "Silent belt drive", "Dual-sided pedals", "Live class ready"],
    basePrice: 1200,
  },
  {
    slug: "ellipticals",
    name: "Ellipticals",
    noun: "Elliptical",
    lines: ["Glide", "Orbit", "Flow", "Arc", "Cross", "Smooth", "Horizon", "Cycle", "Float", "Motion"],
    features: ["Long natural stride", "Low impact", "Silent operation", "Moving handlebars", "20 resistance levels"],
    basePrice: 1500,
  },
  {
    slug: "rowers",
    name: "Rowers",
    noun: "Rower",
    lines: ["Wave", "Current", "Stream", "Rapid", "Tide", "Surge", "Flux", "Ripple", "Cascade", "Drift"],
    features: ["Foldable frame", "Full-body workout", "Smooth resistance", "Performance monitor", "Ergonomic seat"],
    basePrice: 1100,
  },
  {
    slug: "strength",
    name: "Strength Stations",
    noun: "Station",
    lines: ["Multi", "Power", "Core", "Titan", "Forge", "Atlas", "Fortress", "Pillar", "Anchor", "Vault"],
    features: ["All-in-one", "Compact footprint", "Smooth cable motion", "Weight stack", "Multiple grips"],
    basePrice: 2400,
  },
  {
    slug: "free-weights",
    name: "Free Weights",
    noun: "Set",
    lines: ["Dumbbell", "Kettlebell", "Barbell", "Plate", "Hex", "Olympic", "Adjustable", "Cast", "Rubber", "Chrome"],
    features: ["Adjustable weight", "Space saving", "Quick change", "Knurled grip", "Floor friendly"],
    basePrice: 250,
  },
  {
    slug: "benches",
    name: "Benches",
    noun: "Bench",
    lines: ["Flat", "Incline", "Olympic", "Utility", "Folding", "Adjustable", "Preacher", "Decline", "Weight", "Training"],
    features: ["Stable frame", "Integrated storage", "Adjustable back pad", "Compact", "High-density padding"],
    basePrice: 320,
  },
  {
    slug: "racks",
    name: "Racks & Cages",
    noun: "Rack",
    lines: ["Power", "Squat", "Half", "Wall", "Folding", "Smith", "Combo", "Open", "Pro", "Compact"],
    features: ["Pull-up bar", "Safety spotters", "Plate storage", "Steel frame", "J-cup hooks"],
    basePrice: 700,
  },
  {
    slug: "cardio-accessories",
    name: "Cardio Accessories",
    noun: "Trainer",
    lines: ["Jump", "Speed", "Ladder", "Step", "Cone", "Sled", "Battle", "Slam", "Resistance", "Agility"],
    features: ["Portable", "Durable build", "Adjustable length", "Non-slip", "Storage bag included"],
    basePrice: 60,
  },
  {
    slug: "recovery",
    name: "Recovery",
    noun: "Tool",
    lines: ["Massage", "Foam", "Percussion", "Roller", "Mobility", "Compression", "Therapy", "Relief", "Restore", "Flex"],
    features: ["Deep-tissue relief", "Rechargeable", "Multiple speeds", "Quiet motor", "Travel ready"],
    basePrice: 90,
  },
  {
    slug: "apparel",
    name: "Apparel",
    noun: "Wear",
    lines: ["Performance", "Active", "Training", "Studio", "Court", "Run", "Lift", "Flex", "Cool", "Pro"],
    features: ["Breathable fabric", "Moisture wicking", "Four-way stretch", "Flatlock seams", "Reflective details"],
    basePrice: 45,
  },
  {
    slug: "nutrition",
    name: "Nutrition",
    noun: "Blend",
    lines: ["Whey", "Plant", "Recovery", "Energy", "Hydration", "Pre", "Daily", "Lean", "Vital", "Boost"],
    features: ["No added sugar", "Mixes easily", "Informed-sport tested", "Vegan option", "30 servings"],
    basePrice: 35,
  },
];

const TIERS = [
  { suffix: " Lite", label: "Lite", priceMult: 0.7, badge: undefined as string | undefined },
  { suffix: "", label: "", priceMult: 1, badge: undefined },
  { suffix: " Pro", label: "Pro", priceMult: 1.6, badge: undefined },
];

const ROTATING_BADGES = ["Bestseller", "New", "For you", "Limited", "Eco"];

const ADJECTIVES = [
  "Carbon", "Titan", "Nova", "Vertex", "Quantum", "Pulse", "Apex", "Stealth",
  "Helix", "Flux", "Onyx", "Aurora", "Zenith", "Vortex", "Cobalt", "Ember",
  "Polar", "Solar", "Lunar", "Atlas", "Nimbus", "Echo", "Ridge", "Delta",
];
const COLORS = [
  "Black", "Graphite", "Sand", "Olive", "Steel", "Ivory", "Crimson",
  "Cobalt", "Forest", "Slate",
];
const EDITIONS = ["Edition", "Series", "Build", "Model", "Mark"];

/** Deterministic small PRNG so the random catalog is stable across reseeds. */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Generate a batch of randomized demo products for a category. */
function buildRandom(cat: CategorySeed, count: number, seed: number) {
  const rand = rng(seed);
  const out: ReturnType<typeof buildProducts> = [];
  for (let i = 0; i < count; i++) {
    const adj = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)];
    const color = COLORS[Math.floor(rand() * COLORS.length)];
    const edition = EDITIONS[Math.floor(rand() * EDITIONS.length)];
    const num = 100 + Math.floor(rand() * 900);
    const name = `${adj} ${cat.noun} ${edition} ${num}`;
    const price = Math.round(cat.basePrice * (0.5 + rand() * 2.2));
    const feats = [...cat.features]
      .sort(() => rand() - 0.5)
      .slice(0, 3 + Math.floor(rand() * 2));
    out.push({
      slug: slugify(`${name}-${color}-${cat.slug}`),
      name: `${name} · ${color}`,
      description: `The ${name} in ${color.toLowerCase()} delivers ${feats[0]?.toLowerCase()} for your ${cat.name.toLowerCase()} setup. Randomly generated demo product.`,
      priceCents: price * 100,
      badge: rand() < 0.18 ? ROTATING_BADGES[Math.floor(rand() * ROTATING_BADGES.length)] : null,
      features: feats,
      variants:
        rand() < 0.5
          ? [
              { name: "Standard", priceDeltaCents: 0 },
              { name: color, priceDeltaCents: Math.round(rand() * 30000) },
            ]
          : [{ name: "Standard", priceDeltaCents: 0 }],
    });
  }
  return out;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.min(n, arr.length));
}

function buildProducts(cat: CategorySeed) {
  const out: {
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    badge: string | null;
    features: string[];
    variants: { name: string; priceDeltaCents: number }[];
  }[] = [];

  let i = 0;
  for (const line of cat.lines) {
    for (const tier of TIERS) {
      const name = `${line} ${cat.noun}${tier.suffix}`;
      const price = Math.round(
        cat.basePrice * tier.priceMult * (1 + (i % 5) * 0.07),
      );
      const feats = pick(
        cat.features.slice((i % 3)).concat(cat.features),
        3 + (i % 2),
      );
      const badge =
        i % 4 === 0 ? ROTATING_BADGES[i % ROTATING_BADGES.length] : null;

      out.push({
        slug: slugify(`${name}-${cat.slug}`),
        name,
        description: `The ${name} brings ${feats[0]?.toLowerCase()} and ${
          feats[1]?.toLowerCase() ?? "smart design"
        } to your ${cat.name.toLowerCase()} setup. A demo product generated for the catalogue.`,
        priceCents: price * 100,
        badge,
        features: feats,
        variants:
          tier.label === "Pro"
            ? [
                { name: "Standard", priceDeltaCents: 0 },
                { name: "Performance package", priceDeltaCents: 25000 },
              ]
            : [{ name: "Standard", priceDeltaCents: 0 }],
      });
      i += 1;
    }
  }
  return out;
}

async function main() {
  // Clean slate (order matters because of relations).
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  let productCount = 0;
  const usedSlugs = new Set<string>();
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci];
    const category = await prisma.category.create({
      data: { slug: cat.slug, name: cat.name },
    });

    // Base products + a randomized batch for volume and variety.
    const batch = [
      ...buildProducts(cat),
      ...buildRandom(cat, 40, (ci + 1) * 7919),
    ].filter((p) => !usedSlugs.has(p.slug) && usedSlugs.add(p.slug));

    for (const p of batch) {
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          currency: "EUR",
          images: JSON.stringify([PRODUCT_IMG, GALLERY_IMG, GALLERY_IMG]),
          features: JSON.stringify(p.features),
          badge: p.badge,
          categoryId: category.id,
          variants: { create: p.variants },
        },
      });
      productCount += 1;
    }
  }

  // Admin account (manage catalog) + regular demo user (shopping flow).
  await prisma.user.create({
    data: {
      email: "admin@movigym.test",
      name: "Store Admin",
      password: await bcrypt.hash("admin1234", 10),
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      email: "demo@movigym.test",
      name: "Demo User",
      password: await bcrypt.hash("demo1234", 10),
      role: "USER",
    },
  });

  console.log(
    `Seeded ${categories.length} categories, ${productCount} products, 2 users (admin + demo).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
