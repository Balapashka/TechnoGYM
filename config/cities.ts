/**
 * Popular cities per checkout country, used as autocomplete suggestions on
 * the checkout form. Keys are `CHECKOUT_COUNTRY_CODES` from
 * `src/schemas/checkout.ts` (asserted by `src/lib/city.test.ts`). The list is
 * a suggestion source only — a city typed by hand is just as valid as long as
 * it passes validation.
 */
export const CITIES_BY_COUNTRY: Record<string, readonly string[]> = {
  RU: [
    "Москва",
    "Санкт-Петербург",
    "Новосибирск",
    "Екатеринбург",
    "Казань",
    "Нижний Новгород",
    "Челябинск",
    "Красноярск",
    "Самара",
    "Уфа",
    "Ростов-на-Дону",
    "Омск",
    "Краснодар",
    "Воронеж",
    "Пермь",
    "Волгоград",
  ],
  KZ: [
    "Астана",
    "Алматы",
    "Шымкент",
    "Караганда",
    "Актобе",
    "Тараз",
    "Павлодар",
    "Усть-Каменогорск",
    "Семей",
    "Атырау",
    "Костанай",
    "Уральск",
  ],
  UZ: [
    "Ташкент",
    "Самарканд",
    "Наманган",
    "Андижан",
    "Бухара",
    "Фергана",
    "Нукус",
    "Карши",
    "Коканд",
    "Ургенч",
  ],
  KG: [
    "Бишкек",
    "Ош",
    "Джалал-Абад",
    "Каракол",
    "Токмок",
    "Нарын",
    "Талас",
    "Баткен",
  ],
};
