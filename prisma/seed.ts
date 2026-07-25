import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORY_IMAGES, FALLBACK_IMAGES } from "./seed-images";

const prisma = new PrismaClient();

/**
 * Catalog generator for the SPORT LINER store.
 *
 * The assortment mirrors the real sourcing model: Chinese equipment by
 * UNIX Fit is stocked at the Moscow warehouse (in stock), Italian equipment
 * by Technogym and Panatta is imported to order. Price bands per brand are
 * calibrated to actual RU retail levels (UNIX Fit bands follow unixfit.ru).
 *
 * The model designations (e.g. "TF-720") are invented so the catalog cannot
 * be mistaken for the manufacturers' official listings.
 */

/** Manufacturer -> country of origin (Russian), as shown on product cards. */
const BRAND_ORIGIN: Record<string, string> = {
  "UNIX Fit": "Китай",
  Technogym: "Италия",
  Panatta: "Италия",
};

/**
 * Chinese equipment is stocked in Moscow; Italian brands ship to order.
 * Availability is derived from the origin, not rolled at random.
 */
const STOCKED_ORIGIN = "Китай";

type BrandSeed = {
  /** Key of BRAND_ORIGIN. */
  name: string;
  /** Base models per brand; each gets the three trim tiers. */
  models: number;
  /** Price band in roubles for this brand within the category. */
  priceFrom: number;
  priceTo: number;
};

type CategorySeed = {
  slug: string;
  name: string;
  /** Russian product noun used as the start of every product name. */
  noun: string;
  brands: BrandSeed[];
  /** Model-code prefixes, combined with a number: "TF-720". */
  codes: string[];
  features: string[];
};

const categories: CategorySeed[] = [
  {
    slug: "treadmills",
    name: "Беговые дорожки",
    noun: "Беговая дорожка",
    brands: [
      { name: "UNIX Fit", models: 4, priceFrom: 12000, priceTo: 297000 },
      { name: "Technogym", models: 2, priceFrom: 850000, priceTo: 2900000 },
    ],
    codes: ["TF", "T", "RUN", "TR", "EXC"],
    features: [
      "Амортизация бегового полотна",
      "Двигатель переменного тока",
      "Электрический угол наклона до 15%",
      "Максимальная скорость 22 км/ч",
      "Сенсорный экран 22\"",
      "Датчики пульса на поручнях",
      "Складная рама",
      "Поддержка Bluetooth и приложений",
    ],
  },
  {
    slug: "bikes",
    name: "Велотренажёры",
    noun: "Велотренажёр",
    brands: [
      { name: "UNIX Fit", models: 4, priceFrom: 27000, priceTo: 99000 },
      { name: "Technogym", models: 2, priceFrom: 590000, priceTo: 1900000 },
    ],
    codes: ["BK", "IC", "SPIN", "U", "R"],
    features: [
      "Магнитная система нагрузки",
      "Маховик 22 кг",
      "Регулировка сиденья и руля в двух плоскостях",
      "Бесшумный ременной привод",
      "Двусторонние педали",
      "Консоль с показателями мощности",
      "Транспортировочные ролики",
    ],
  },
  {
    slug: "ellipticals",
    name: "Эллиптические тренажёры",
    noun: "Эллиптический тренажёр",
    brands: [
      { name: "UNIX Fit", models: 3, priceFrom: 32000, priceTo: 125000 },
      { name: "Technogym", models: 2, priceFrom: 740000, priceTo: 2200000 },
    ],
    codes: ["EL", "CX", "E", "XT", "ELL"],
    features: [
      "Длина шага 51 см",
      "Минимальная ударная нагрузка на суставы",
      "Подвижные рукояти",
      "20 уровней нагрузки",
      "Задний привод",
      "Бесшумный ход",
      "Программы тренировок в консоли",
    ],
  },
  {
    slug: "rowers",
    name: "Гребные тренажёры",
    noun: "Гребной тренажёр",
    brands: [
      { name: "UNIX Fit", models: 3, priceFrom: 27000, priceTo: 92000 },
      { name: "Technogym", models: 1, priceFrom: 520000, priceTo: 950000 },
    ],
    codes: ["RW", "ROW", "WR", "R"],
    features: [
      "Воздушное сопротивление",
      "Складная рама",
      "Проработка всех групп мышц",
      "Монитор производительности",
      "Эргономичное сиденье на рельсе",
      "Регулируемая подножка",
    ],
  },
  {
    slug: "strength",
    name: "Силовые тренажёры",
    noun: "Силовой тренажёр",
    brands: [
      { name: "UNIX Fit", models: 4, priceFrom: 148000, priceTo: 322000 },
      { name: "Technogym", models: 3, priceFrom: 690000, priceTo: 1800000 },
      { name: "Panatta", models: 3, priceFrom: 540000, priceTo: 1600000 },
    ],
    codes: ["ST", "MG", "PL", "SL", "HS"],
    features: [
      "Грузоблок 100 кг",
      "Плавный ход тросовой системы",
      "Компактная площадь установки",
      "Несколько вариантов хвата",
      "Регулировка сиденья под рост",
      "Порошковое покрытие рамы",
    ],
  },
  {
    slug: "free-weights",
    name: "Свободные веса",
    noun: "Набор весов",
    brands: [
      { name: "UNIX Fit", models: 3, priceFrom: 3000, priceTo: 68000 },
      { name: "Technogym", models: 2, priceFrom: 24000, priceTo: 350000 },
      { name: "Panatta", models: 2, priceFrom: 42000, priceTo: 420000 },
    ],
    codes: ["FW", "DB", "KB", "BB", "PL"],
    features: [
      "Обрезиненное покрытие",
      "Насечка на грифе для надёжного хвата",
      "Диски с посадочным диаметром 50 мм",
      "Компактное хранение на стойке",
      "Не повреждает напольное покрытие",
      "Точность массы ±1%",
    ],
  },
  {
    slug: "benches",
    name: "Скамьи",
    noun: "Скамья",
    brands: [
      { name: "UNIX Fit", models: 3, priceFrom: 12000, priceTo: 64000 },
      { name: "Technogym", models: 2, priceFrom: 118000, priceTo: 350000 },
      { name: "Panatta", models: 2, priceFrom: 92000, priceTo: 310000 },
    ],
    codes: ["BN", "FID", "AB", "OB"],
    features: [
      "Регулировка спинки в 7 положениях",
      "Устойчивая стальная рама",
      "Плотная набивка высокой жёсткости",
      "Складная конструкция",
      "Максимальная нагрузка 300 кг",
      "Нескользящая обивка",
    ],
  },
  {
    slug: "racks",
    name: "Стойки и силовые рамы",
    noun: "Силовая рама",
    brands: [
      { name: "UNIX Fit", models: 3, priceFrom: 148000, priceTo: 322000 },
      { name: "Panatta", models: 2, priceFrom: 260000, priceTo: 920000 },
    ],
    codes: ["RK", "PR", "SQ", "HR"],
    features: [
      "Профиль 75×75 мм",
      "Турник с несколькими хватами",
      "Страховочные упоры",
      "Хранение дисков на стойках",
      "J-крюки с полимерной вставкой",
      "Анкерное крепление к полу",
    ],
  },
  {
    slug: "cardio-accessories",
    name: "Аксессуары для кардио",
    noun: "Аксессуар",
    brands: [
      { name: "UNIX Fit", models: 4, priceFrom: 1500, priceTo: 32000 },
      { name: "Technogym", models: 2, priceFrom: 8000, priceTo: 120000 },
    ],
    codes: ["CA", "AX", "JR", "SL"],
    features: [
      "Компактное хранение",
      "Износостойкие материалы",
      "Регулируемая длина",
      "Нескользящее покрытие",
      "Сумка для переноски в комплекте",
    ],
  },
  {
    slug: "recovery",
    name: "Восстановление",
    noun: "Средство восстановления",
    brands: [
      { name: "UNIX Fit", models: 3, priceFrom: 49000, priceTo: 299000 },
      { name: "Technogym", models: 2, priceFrom: 15000, priceTo: 155000 },
    ],
    codes: ["RC", "MG", "FR", "PT"],
    features: [
      "Глубокая проработка мышц",
      "Аккумулятор на 6 часов работы",
      "Несколько режимов интенсивности",
      "Тихий двигатель",
      "Кейс для поездок",
    ],
  },
];

const TIERS = [
  { suffix: "", label: "Base", priceMult: 1 },
  { suffix: " Pro", label: "Pro", priceMult: 1.2 },
  { suffix: " Elite", label: "Elite", priceMult: 1.42 },
];

const BADGES = ["Хит продаж", "Новинка", "Выгодная цена", "Топ выбор"];

/** Deterministic PRNG so the generated catalog is stable across reseeds. */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Deterministic Fisher-Yates shuffle driven by the seeded PRNG. */
function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Round to a price that looks like a real shelf price. */
function tidyPrice(rub: number): number {
  if (rub >= 100000) return Math.round(rub / 1000) * 1000 - 100;
  if (rub >= 10000) return Math.round(rub / 500) * 500 - 100;
  if (rub >= 3000) return Math.round(rub / 100) * 100 - 10;
  return Math.round(rub / 50) * 50 - 10;
}

type GeneratedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  badge: string | null;
  brand: string;
  originCountry: string;
  inStock: boolean;
  images: string[];
  features: string[];
  variants: { name: string; priceDeltaCents: number }[];
};

function buildProducts(cat: CategorySeed, seed: number): GeneratedProduct[] {
  const rand = rng(seed);
  const pool = CATEGORY_IMAGES[cat.slug]?.length
    ? CATEGORY_IMAGES[cat.slug]
    : FALLBACK_IMAGES;
  const out: GeneratedProduct[] = [];

  let i = 0;
  for (const brand of cat.brands) {
    const origin = BRAND_ORIGIN[brand.name] ?? "";
    const inStock = origin === STOCKED_ORIGIN;
    const span = brand.priceTo - brand.priceFrom;

    for (let m = 0; m < brand.models; m++) {
      for (const tier of TIERS) {
        const code = cat.codes[i % cat.codes.length];
        const model = `${code}-${100 + ((i * 37) % 800)}`;
        const name = `${cat.noun} ${brand.name} ${model}${tier.suffix}`;

        // The model index walks the brand's own band from entry to flagship;
        // the trim tier lifts the price within it, clamped back to the band.
        const position = (m + 0.2 + rand() * 0.4) / brand.models;
        const base = brand.priceFrom + span * position * 0.7;
        const priceRub = tidyPrice(
          Math.min(brand.priceTo, Math.max(brand.priceFrom, base * tier.priceMult)),
        );

        const features = shuffle(cat.features, rand).slice(
          0,
          4 + Math.floor(rand() * 2),
        );

        // Rotate through the category's photos so the grid does not repeat.
        const main = pool[i % pool.length];
        const gallery = [
          pool[(i + 1) % pool.length],
          pool[(i + 2) % pool.length],
        ];

        out.push({
          slug: slugify(`${brand.name}-${model}-${tier.label}-${cat.slug}`),
          name,
          description:
            `${name}. Производитель — ${brand.name}, страна производства — ${origin}. ` +
            `Ключевые особенности: ${features
              .slice(0, 3)
              .map((f) => f.toLowerCase())
              .join(", ")}. ` +
            (inStock
              ? "В наличии на складе в Москве."
              : "Поставка под заказ из Италии."),
          priceCents: priceRub * 100,
          badge: i % 5 === 0 ? BADGES[(i / 5) % BADGES.length] : null,
          brand: brand.name,
          originCountry: origin,
          inStock,
          images: [main, ...gallery],
          features,
          variants:
            tier.label === "Base"
              ? [{ name: "Стандартная комплектация", priceDeltaCents: 0 }]
              : [
                  { name: "Стандартная комплектация", priceDeltaCents: 0 },
                  {
                    name: "Расширенная комплектация",
                    priceDeltaCents: Math.round((priceRub * 0.12) / 100) * 100 * 100,
                  },
                ],
        });
        i += 1;
      }
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

    const batch = buildProducts(cat, (ci + 1) * 7919).filter(
      (p) => !usedSlugs.has(p.slug) && usedSlugs.add(p.slug),
    );

    for (const p of batch) {
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          currency: "RUB",
          images: JSON.stringify(p.images),
          features: JSON.stringify(p.features),
          badge: p.badge,
          brand: p.brand,
          originCountry: p.originCountry,
          inStock: p.inStock,
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
