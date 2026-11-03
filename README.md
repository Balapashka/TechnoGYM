# SPORT LINER — интернет-магазин тренажёров

> 👉 **Владельцу магазина:** [НАЧАТЬ-ОТСЮДА.md](НАЧАТЬ-ОТСЮДА.md) — что умеет
> сайт и как его посмотреть; [ЗАПУСК-ПРОДАЖ.md](ЗАПУСК-ПРОДАЖ.md) — как
> запустить на своём домене и начать продавать. Этот README — для разработчика.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma + SQLite · Zustand · Zod + React Hook Form · Vitest · nodemailer.

## Возможности

- Каталог с фасетными фильтрами, сравнением, быстрым просмотром и поиском
  (`/search`), карточки товаров с вариантами комплектации, Schema.org Product.
- Две модели продаж: цена + корзина (товары со склада) и «Цена по запросу» +
  заявка (импорт под заказ). Цена скрытых товаров не попадает в браузер
  (см. `CLAUDE.md`).
- Оформление заказа с телефоном, доставкой/самовывозом, комментарием и
  согласием на обработку ПДн; цены и названия перечитываются из БД.
- Оплата: «после подтверждения менеджером» (по умолчанию) или онлайн через
  ЮKassa (redirect + webhook с перепроверкой статуса через API, чеки 54-ФЗ).
  Данные карты на сайте не вводятся.
- Уведомления менеджеру в Telegram и по почте, письма покупателю о заказе и
  смене статуса, сброс пароля по ссылке из письма.
- Админка: заказы (статусы, заметки), заявки, товары с загрузкой фото,
  категории, импорт/экспорт каталога в CSV (Excel), подписчики, настройки
  магазина (контакты, реквизиты, соцсети — без пересборки).
- Юридические страницы (политика ПДн, оферта, возврат, cookie, соглашение)
  с подстановкой реквизитов из настроек.
- Безопасность: bcrypt, httpOnly-сессии, ограничение частоты запросов,
  honeypot в формах, заголовки безопасности, все `/api/admin/*` проверяют роль.
- RU/EN, отображение цен в валютах СНГ (≈, оплата в рублях).

## Запуск

### Docker (рекомендуется)

```bash
cp .env.example .env      # для локального просмотра: DEMO_ACCOUNTS=true
docker compose up --build # http://localhost:3000
```

При старте контейнер применяет миграции, при пустой БД загружает стартовый
каталог, создаёт администратора из `ADMIN_EMAIL`/`ADMIN_PASSWORD` (и тестовые
аккаунты, только если `DEMO_ACCOUNTS=true`). База, загруженные фото и бэкапы —
в томе `db-data` (`/app/data`).

Боевой сервер с HTTPS (Caddy + Let's Encrypt):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Подробно — [ЗАПУСК-ПРОДАЖ.md](ЗАПУСК-ПРОДАЖ.md), раздел 3.

### Без Docker (разработка)

Node.js 22+.

```bash
npm install
cp .env.example .env        # DEMO_ACCOUNTS=true для тестовых аккаунтов
npx prisma migrate deploy
npm run dev                 # http://localhost:3000
```

`prisma/dev.db` в репозитории уже содержит стартовый каталог и тестовые
аккаунты (`admin@movigym.test` / `admin1234`, `demo@movigym.test` / `demo1234`).
Пересоздать: `DEMO_ACCOUNTS=true npm run db:reset`.

### Команды

```bash
npm run check        # тесты → typecheck → lint → build (перед пушем)
npm run dev          # dev-сервер
npm run build && npm run start
npm test             # Vitest
npm run lint
npm run typecheck
npm run db:migrate   # prisma migrate deploy
npm run db:reset     # сбросить БД и загрузить стартовый каталог

node scripts/create-admin.mjs owner@mail.ru 'Пароль123456'  # создать/сбросить админа
node scripts/backup-db.mjs                                   # бэкап SQLite в data/backups
```

## Переменные окружения

Полный список с комментариями — [`.env.example`](.env.example). Контакты и
реквизиты магазина — не в env, а в `/admin/settings` (таблица `Setting`).

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `SITE_URL` | `http://localhost:3000` | Публичный адрес: письма, return URL ЮKassa, sitemap, OG |
| `DOMAIN` | — | Домен для Caddy (`docker-compose.prod.yml`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | — | Администратор, создаётся при старте (пароль не перезаписывается) |
| `ADMIN_RESET_PASSWORD` | `false` | Однократно сбросить пароль администратора на `ADMIN_PASSWORD` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | — | Уведомления менеджеру в Telegram |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | — | Почта; без `SMTP_HOST` письма не отправляются |
| `NOTIFY_EMAIL` | email из настроек | Куда слать уведомления менеджеру |
| `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` | — | Онлайн-оплата; без них только оплата после подтверждения |
| `YOOKASSA_SEND_RECEIPT`, `YOOKASSA_VAT_CODE` | `false`, `1` | Чеки 54-ФЗ через «Чеки от ЮKassa» |
| `SITE_INDEXABLE` | `false` | Разрешить индексацию (robots.txt) |
| `SESSION_COOKIE_SECURE` | `false` | `true` на HTTPS, иначе вход не работает по HTTP |
| `NEXT_PUBLIC_INSTALLMENT_MONTHS` | `0` | Строка рассрочки под ценой (build-time) |
| `DEMO_ACCOUNTS` | `false` | Тестовые аккаунты с публичными паролями — только локально |
| `DEMO_EXPOSE_RESET_TOKEN` | `false` | Показывать код сброса пароля на экране — только локально |

Админка показывает предупреждения, если не заполнены обязательные реквизиты
продавца или включён тестовый режим.

## Интеграции

- **ЮKassa.** `/api/checkout` создаёт заказ (PENDING) и платёж, покупатель
  уходит на страницу ЮKassa и возвращается на `/checkout/result?order=…`.
  `/api/payments/yookassa` — HTTP-уведомления: тело не доверенное, платёж
  перечитывается через API, сверяется сумма, заказ → PAID.
  `/api/payments/retry` — повторная попытка оплаты.
- **Telegram / SMTP** — `src/lib/notify.ts`, тексты — `src/lib/notify-messages.ts`
  (покрыты тестами). Отправка после ответа (`after()`), ошибки не ломают заказ.
- **Фото товаров** — `/api/admin/uploads` (проверка по сигнатуре файла, до 8 МБ),
  хранение в `data/uploads`, отдача через `/uploads/<uuid>.<ext>`.
- **Импорт каталога** — `/api/admin/catalog/import|export`, формат в
  `src/lib/csv.ts` (Excel RU: `;`, UTF-8 BOM или Windows-1251), «всё или ничего».

## Структура

```
src/
  app/
    (shop)/            # каталог, карточка товара, поиск
    (content)/         # маркетинговые страницы + [page] (юр. и инфо-страницы)
    admin/             # админка (только ADMIN)
    api/               # auth, checkout, payments, quote-requests, subscribe, admin/*
    checkout/          # оформление и страница результата заказа
    uploads/[name]/    # отдача загруженных фото
  components/          # layout/, home/, shop/, content/, admin/, ui/, motion/
  lib/                 # prisma, catalog DTO, auth, settings, notify, payments,
                       # rate-limit, csv, search, order, format, pages (тексты)
  store/               # zustand: корзина, локаль, сравнение, UI
  schemas/             # zod: checkout, auth, quote, product, settings
  i18n/                # словари ru/en
prisma/                # schema, миграции, seed, dev.db
scripts/               # docker-entrypoint, create-admin, backup-db, seed-if-empty
deploy/Caddyfile       # HTTPS reverse proxy для docker-compose.prod.yml
```

## Тесты

`npm test` — Vitest (jsdom), чистая логика: форматирование цен, фильтры и URL
каталога, сборка заказа, схемы (оформление, заявки), корзина/локаль/сравнение,
поиск, CSV-импорт, тексты уведомлений, словари и сканирование всех `t("…")`.

## Медиа

Слоты изображений сайта (герой, плитки категорий, заглушки) — в
[`config/media.json`](config/media.json); положите файл в `public/` и укажите
путь в `src`. Фото товаров задаются в админке (загрузка или ссылки https://).
