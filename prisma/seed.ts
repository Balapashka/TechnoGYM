import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORY_IMAGES, FALLBACK_IMAGES } from "./seed-images";

const prisma = new PrismaClient();

/**
 * Catalog generator for the SPORT LINER demo store.
 *
 * Products are generated, but the surrounding data is real: manufacturer names
 * are actual fitness-equipment brands, `originCountry` is that brand's home
 * country, prices are in roubles at plausible CIS retail levels, and the photos
 * are real Unsplash gym imagery.
 *
 * The model designations (e.g. "TF-720") are invented so nothing here can be
 * mistaken for a genuine product listing — this is an educational demo.
 */

/** Manufacturer -> country of origin (Russian), as shown on product cards. */
const BRAND_ORIGIN: Record<string, string> = {
  Technogym: "Италия",
  Panatta: "Италия",
  "Life Fitness": "США",
  "Hammer Strength": "США",
  Precor: "США",
  Cybex: "США",
  Concept2: "США",
  "Body-Solid": "США",
  "Rogue Fitness": "США",
  NordicTrack: "США",
  Hyperice: "США",
  Therabody: "США",
  "Optimum Nutrition": "США",
  "Under Armour": "США",
  Matrix: "Тайвань",
  "Spirit Fitness": "Тайвань",
  Kettler: "Германия",
  Weider: "Германия",
  Blackroll: "Германия",
  Adidas: "Германия",
  Eleiko: "Швеция",
  "BH Fitness": "Испания",
  Tunturi: "Финляндия",
  "Scitec Nutrition": "Венгрия",
  Impulse: "Китай",
  "DHZ Fitness": "Китай",
  "Bronze Gym": "Китай",
  "Oxygen Fitness": "Китай",
  "Clear Fit": "Китай",
  Aerofit: "Россия",
  Maxler: "Германия",
};

type CategorySeed = {
  slug: string;
  name: string;
  /** Russian product noun used as the start of every product name. */
  noun: string;
  /** Brands sold in this category (keys of BRAND_ORIGIN). */
  brands: string[];
  /** Model-code prefixes, combined with a number: "TF-720". */
  codes: string[];
  features: string[];
  priceFrom: number; // roubles
  priceTo: number; // roubles
};

const categories: CategorySeed[] = [
  {
    slug: "treadmills",
    name: "Беговые дорожки",
    noun: "Беговая дорожка",
    brands: ["Technogym", "Matrix", "Life Fitness", "Precor", "NordicTrack", "Spirit Fitness", "Bronze Gym", "Oxygen Fitness"],
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
    priceFrom: 120000,
    priceTo: 890000,
  },
  {
    slug: "bikes",
    name: "Велотренажёры",
    noun: "Велотренажёр",
    brands: ["Technogym", "Matrix", "Life Fitness", "Kettler", "BH Fitness", "Spirit Fitness", "Bronze Gym", "Clear Fit"],
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
    priceFrom: 55000,
    priceTo: 520000,
  },
  {
    slug: "ellipticals",
    name: "Эллиптические тренажёры",
    noun: "Эллиптический тренажёр",
    brands: ["Technogym", "Matrix", "Precor", "Life Fitness", "Tunturi", "Spirit Fitness", "Oxygen Fitness", "Aerofit"],
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
    priceFrom: 90000,
    priceTo: 640000,
  },
  {
    slug: "rowers",
    name: "Гребные тренажёры",
    noun: "Гребной тренажёр",
    brands: ["Concept2", "Technogym", "Matrix", "Life Fitness", "Kettler", "Aerofit", "Clear Fit"],
    codes: ["RW", "ROW", "WR", "R"],
    features: [
      "Воздушное сопротивление",
      "Складная рама",
      "Проработка всех групп мышц",
      "Монитор производительности",
      "Эргономичное сиденье на рельсе",
      "Регулируемая подножка",
    ],
    priceFrom: 75000,
    priceTo: 460000,
  },
  {
    slug: "strength",
    name: "Силовые тренажёры",
    noun: "Силовой тренажёр",
    brands: ["Technogym", "Hammer Strength", "Panatta", "Cybex", "Life Fitness", "Matrix", "Impulse", "DHZ Fitness"],
    codes: ["ST", "MG", "PL", "SL", "HS"],
    features: [
      "Грузоблок 100 кг",
      "Плавный ход тросовой системы",
      "Компактная площадь установки",
      "Несколько вариантов хвата",
      "Регулировка сиденья под рост",
      "Порошковое покрытие рамы",
    ],
    priceFrom: 160000,
    priceTo: 1250000,
  },
  {
    slug: "free-weights",
    name: "Свободные веса",
    noun: "Набор весов",
    brands: ["Eleiko", "Rogue Fitness", "Body-Solid", "Technogym", "Bronze Gym", "Aerofit", "Impulse"],
    codes: ["FW", "DB", "KB", "BB", "PL"],
    features: [
      "Обрезиненное покрытие",
      "Насечка на грифе для надёжного хвата",
      "Диски с посадочным диаметром 50 мм",
      "Компактное хранение на стойке",
      "Не повреждает напольное покрытие",
      "Точность массы ±1%",
    ],
    priceFrom: 6000,
    priceTo: 190000,
  },
  {
    slug: "benches",
    name: "Скамьи",
    noun: "Скамья",
    brands: ["Body-Solid", "Rogue Fitness", "Technogym", "Panatta", "Impulse", "Bronze Gym", "Aerofit"],
    codes: ["BN", "FID", "AB", "OB"],
    features: [
      "Регулировка спинки в 7 положениях",
      "Устойчивая стальная рама",
      "Плотная набивка высокой жёсткости",
      "Складная конструкция",
      "Максимальная нагрузка 300 кг",
      "Нескользящая обивка",
    ],
    priceFrom: 15000,
    priceTo: 145000,
  },
  {
    slug: "racks",
    name: "Стойки и силовые рамы",
    noun: "Силовая рама",
    brands: ["Rogue Fitness", "Eleiko", "Body-Solid", "Panatta", "Impulse", "DHZ Fitness", "Aerofit"],
    codes: ["RK", "PR", "SQ", "HR"],
    features: [
      "Профиль 75×75 мм",
      "Турник с несколькими хватами",
      "Страховочные упоры",
      "Хранение дисков на стойках",
      "J-крюки с полимерной вставкой",
      "Анкерное крепление к полу",
    ],
    priceFrom: 45000,
    priceTo: 390000,
  },
  {
    slug: "cardio-accessories",
    name: "Аксессуары для кардио",
    noun: "Аксессуар",
    brands: ["Rogue Fitness", "Body-Solid", "Bronze Gym", "Clear Fit", "Impulse", "Aerofit"],
    codes: ["CA", "AX", "JR", "SL"],
    features: [
      "Компактное хранение",
      "Износостойкие материалы",
      "Регулируемая длина",
      "Нескользящее покрытие",
      "Сумка для переноски в комплекте",
    ],
    priceFrom: 1500,
    priceTo: 28000,
  },
  {
    slug: "recovery",
    name: "Восстановление",
    noun: "Средство восстановления",
    brands: ["Therabody", "Hyperice", "Blackroll", "Technogym", "Bronze Gym"],
    codes: ["RC", "MG", "FR", "PT"],
    features: [
      "Глубокая проработка мышц",
      "Аккумулятор на 6 часов работы",
      "Несколько режимов интенсивности",
      "Тихий двигатель",
      "Кейс для поездок",
    ],
    priceFrom: 2500,
    priceTo: 75000,
  },
  {
    slug: "apparel",
    name: "Спортивная одежда",
    noun: "Комплект одежды",
    brands: ["Adidas", "Under Armour", "Kettler", "Technogym"],
    codes: ["AP", "TR", "FT"],
    features: [
      "Дышащая ткань",
      "Отведение влаги",
      "Эластичность в четырёх направлениях",
      "Плоские швы",
      "Светоотражающие элементы",
    ],
    priceFrom: 2500,
    priceTo: 24000,
  },
  {
    slug: "nutrition",
    name: "Спортивное питание",
    noun: "Спортивное питание",
    brands: ["Optimum Nutrition", "Weider", "Maxler", "Scitec Nutrition"],
    codes: ["NT", "PR", "WH", "AM"],
    features: [
      "Без добавленного сахара",
      "Легко размешивается",
      "24 г белка в порции",
      "Вегетарианская линейка",
      "30 порций в упаковке",
    ],
    priceFrom: 1500,
    priceTo: 16000,
  },
];

/**
 * Where a brand sits in the category's price band: 0 = entry, 1 = flagship.
 * Without this the price is a blind draw and a budget OEM brand can outprice
 * Technogym in the same listing.
 */
const BRAND_TIER: Record<string, number> = {
  Technogym: 0.95,
  Panatta: 0.85,
  "Hammer Strength": 0.85,
  Eleiko: 0.9,
  Cybex: 0.8,
  Precor: 0.8,
  "Life Fitness": 0.78,
  Concept2: 0.7,
  "Rogue Fitness": 0.7,
  Therabody: 0.7,
  Hyperice: 0.65,
  Matrix: 0.6,
  Kettler: 0.5,
  "BH Fitness": 0.45,
  Tunturi: 0.45,
  "Spirit Fitness": 0.45,
  NordicTrack: 0.5,
  "Body-Solid": 0.45,
  Blackroll: 0.4,
  "Under Armour": 0.4,
  Adidas: 0.4,
  "Optimum Nutrition": 0.45,
  "Scitec Nutrition": 0.35,
  Weider: 0.35,
  Maxler: 0.3,
  Impulse: 0.3,
  "DHZ Fitness": 0.3,
  Aerofit: 0.28,
  "Bronze Gym": 0.25,
  "Oxygen Fitness": 0.2,
  "Clear Fit": 0.15,
};

const TIERS = [
  { suffix: "", label: "Base", priceMult: 1 },
  { suffix: " Pro", label: "Pro", priceMult: 1.45 },
  { suffix: " Elite", label: "Elite", priceMult: 1.9 },
];

const BADGES = ["Хит продаж", "Новинка", "Выгодная цена", "Топ выбор", "Под заказ"];

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
    for (const tier of TIERS) {
      const code = cat.codes[i % cat.codes.length];
      const model = `${code}-${100 + ((i * 37) % 800)}`;
      const name = `${cat.noun} ${brand} ${model}${tier.suffix}`;
      const origin = BRAND_ORIGIN[brand] ?? "";

      // Anchor the price on where the brand sits in the band, jitter it a
      // little, apply the model tier, then clamp back inside [from, to].
      const span = cat.priceTo - cat.priceFrom;
      const position = (BRAND_TIER[brand] ?? 0.5) * 0.55 + rand() * 0.12;
      const base = cat.priceFrom + span * position;
      const priceRub = tidyPrice(
        Math.min(cat.priceTo, Math.max(cat.priceFrom, base * tier.priceMult)),
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
        slug: slugify(`${brand}-${model}-${tier.label}-${cat.slug}`),
        name,
        description:
          `${name}. Производитель — ${brand}, страна производства — ${origin}. ` +
          `Ключевые особенности: ${features
            .slice(0, 3)
            .map((f) => f.toLowerCase())
            .join(", ")}. ` +
          `Демонстрационная карточка товара: характеристики и цена приведены для примера.`,
        priceCents: priceRub * 100,
        badge: i % 5 === 0 ? BADGES[(i / 5) % BADGES.length] : null,
        brand,
        originCountry: origin,
        inStock: rand() > 0.12,
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
