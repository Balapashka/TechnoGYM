import type { LandingContent } from "@/components/content/ThemedLanding";

/** Тексты лендингов «Здоровье» и «Дизайн».
 *  Фото лежат в public/media (сервер в РФ не загружает внешние фотостоки) —
 *  снимки Unsplash (бесплатная лицензия, в том числе для коммерции). */
export const landings: Record<string, LandingContent> = {
  wellness: {
    eyebrow: "Велнес",
    title: "Двигайся лучше, живи дольше",
    tagline:
      "Велнес — это не только тренировки. Это сон, восстановление и небольшие ежедневные победы, из которых складывается результат.",
    gradient: "bg-gradient-to-br from-emerald-700 to-emerald-900",
    heroImage: "/media/wellness-hero.jpg",
    heroOverlay: "bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-900/25",
    tiles: [
      { title: "Движение", text: "Кардио каждый день — для любого уровня подготовки и любой площади.", image: "/media/wellness-move.jpg" },
      { title: "Сила", text: "Базовые упражнения со свободными весами укрепляют мышцы и берегут суставы.", image: "/media/wellness-strength.jpg" },
      { title: "Восстановление", text: "Ролики, растяжка и мягкая нагрузка, чтобы прогресс закреплялся.", image: "/media/wellness-recovery.jpg" },
      { title: "Мобильность", text: "Коврик, дыхательные практики и мобилити-паузы между подходами.", image: "/media/wellness-mobility.jpg" },
      { title: "Отдых", text: "Сон и расслабление — половина результата: тело растёт, пока отдыхает.", image: "/media/wellness-rest.jpg" },
    ],
    sections: [
      { heading: "Под ваш ритм дня", body: "Короткие гибкие тренировки, которые вписываются в плотный график: без дороги в зал и без отговорок.", image: "/media/wellness-1.jpg" },
      { heading: "Прогресс, который чувствуется", body: "Следите за нагрузкой и восстановлением, чтобы тренироваться с умом, а не только на пределе.", image: "/media/wellness-2.jpg" },
      { heading: "Для любого тела", body: "Каким бы ни был ваш старт, здесь найдётся путь, который подойдёт именно вам.", image: "/media/wellness-3.jpg" },
    ],
    ctaLabel: "Смотреть каталог",
    ctaHref: "/collections",
  },
  design: {
    eyebrow: "Дизайн",
    title: "Создано для вашего дома",
    tagline:
      "Оборудование должно выглядеть так же хорошо, как работает. Материалы, форма и детали, которые естественно вписываются в интерьер.",
    gradient: "bg-gradient-to-br from-zinc-700 to-zinc-900",
    heroImage: "/media/design-hero.jpg",
    featureImage: "/media/design-feature.jpg",
    tiles: [
      { title: "Форма", text: "Чистые линии, уместные в гостиной, а не только в зале.", image: "/media/design-form.jpg" },
      { title: "Материалы", text: "Износостойкие поверхности, которые сохраняют вид и приятны на ощупь.", image: "/media/design-materials.jpg" },
      { title: "Габариты", text: "Компактные конструкции для небольших пространств.", image: "/media/design-size.jpg" },
      { title: "Детали", text: "Продуманная отделка — вплоть до последнего болта и шва.", image: "/media/design-details.jpg" },
      { title: "Тишина", text: "Плавные, почти бесшумные механизмы для тренировок в любое время.", image: "/media/design-quiet.jpg" },
    ],
    sections: [
      { heading: "Осмысленный дизайн", body: "Каждый изгиб и каждый материал выбраны так, чтобы выдерживать нагрузку и выглядеть легко." },
      { heading: "Сделано надолго", body: "Честная конструкция для ежедневных тренировок на годы, а не на один сезон." },
      { heading: "Дома — где угодно", body: "Решения, которые одинаково уместны и в небольшой студии, и в отдельном тренировочном зале." },
    ],
    ctaLabel: "Смотреть товары",
    ctaHref: "/collections",
  },
};

export const landingSlugs = Object.keys(landings);
