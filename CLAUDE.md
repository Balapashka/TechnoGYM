# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"SPORT LINER" — a fitness-equipment online store being prepared for launch (Next.js 16 App
Router, React 19, TypeScript, Tailwind v4, Prisma + SQLite, Zustand, Zod, Vitest, nodemailer).
The starter catalog (models, prices, photos) is still placeholder content that the owner replaces
via `/admin/import`; owner-facing docs are `НАЧАТЬ-ОТСЮДА.md` and `ЗАПУСК-ПРОДАЖ.md`. The brand name lives in
`src/lib/brand.ts` — internal identifiers (`movigym_session` cookie, `movigym-cart` /
`movigym-locale` storage keys, `@movigym.test` demo accounts) deliberately keep the old name so
existing sessions and the documented credentials keep working.

## Commands

```bash
npm run dev                      # dev server on :3000
npm run build && npm run start   # production build
npm run lint                     # eslint (flat config, next/core-web-vitals + TS)
npm test                         # vitest run (jsdom)
npm run test:watch

npx vitest run src/lib/order.test.ts        # single file
npx vitest run -t "merges the same variant" # single test by name

npm run db:migrate   # prisma migrate deploy
npm run db:seed      # tsx prisma/seed.ts (procedural catalog)
npm run db:reset     # migrate reset --force (drops + reseeds)

docker compose up --build   # full stack; entrypoint migrates, seeds an empty DB, creates admin
docker compose -f docker-compose.prod.yml up -d --build   # + Caddy HTTPS for a real domain
# Production server: scripts/server-setup.sh installs everything plus a systemd timer
# (sportliner-update) that pulls the deploy branch every 10 min and rebuilds on change.
node scripts/create-admin.mjs email 'password'            # create admin / reset its password
node scripts/backup-db.mjs                                # VACUUM INTO data/backups
```

First-time local setup: `npm install` → `cp .env.example .env` → `npx prisma migrate dev` →
`npx prisma db seed`. `postinstall` runs `prisma generate`, so the client is regenerated on install;
after editing `prisma/schema.prisma` run a migration (or at least `npx prisma generate`) manually.

Test accounts `admin@movigym.test` / `admin1234` (ADMIN) and `demo@movigym.test` / `demo1234`
exist **only when `DEMO_ACCOUNTS=true`**: the seed creates them, the Docker entrypoint re-ensures
them (resetting passwords) and the login page lists them. On a live store the administrator comes
from `ADMIN_EMAIL`/`ADMIN_PASSWORD` via `scripts/create-admin.mjs` (never overwrites an existing
password unless `ADMIN_RESET_PASSWORD=true`). The tracked `prisma/dev.db` is seeded with
`DEMO_ACCOUNTS=true` for local development.

## Architecture

**Next.js version caveat** — see `AGENTS.md`: this is Next.js 16 and its APIs may differ from
training data. Consult `node_modules/next/dist/docs/` before using an unfamiliar API. Note route
`params` are Promises and must be awaited.

**Data path: Prisma → DTO → server component → client component.**
`src/lib/catalog.ts` is the only place that reads products. It converts Prisma rows into
`ProductDTO` (`toDTO`), which is what every page and component consumes. SQLite has no scalar list
columns, so `Product.images` and `Product.features` are JSON **strings** in the DB; always go
through `packList`/`unpackList` in `src/lib/json.ts` rather than `JSON.parse` inline. If you add a
list-shaped product field, follow the same pattern and extend `toDTO`.

**Catalog data.** The live store's catalog is real: ~140 UNIX Fit trainers (prices and photos
from unixfit.ru) and ~120 Technogym models (price on request), built and uploaded by
`tools/catalog/` (see its README) through `/admin/import`. Photos are stored on the server
(`/uploads`), because a server in Russia cannot fetch images.unsplash.com — never point the
storefront at external image hosts. The seed below is only the local/dev starter set.
`prisma/seed.ts` generates ~180 products across 10 equipment categories,
mirroring the real sourcing model: `UNIX Fit` (Китай) is stocked in Moscow (`inStock: true`),
`Technogym`/`Panatta` (Италия) are imported to order (`inStock: false` = "Под заказ", still
purchasable). Availability derives from `originCountry`, never at random. Per-brand price bands
are calibrated to actual RU retail levels (UNIX Fit follows unixfit.ru); model codes are invented
so the catalog is not the manufacturers' official listing. Product photography comes from
`prisma/seed-images.ts`, a slug → verified `images.unsplash.com` URL map (the host is whitelisted
in `next.config.ts`). `brand`/`originCountry` are non-null with an `""` default so the column could
be added without a data migration; the UI (`ProductOrigin`) hides an empty value, and the admin
form requires one.

**Two sales models in one catalog.** `Product.priceOnRequest` splits the storefront: the stocked
UNIX Fit range (Китай) shows a price and sells through the cart, while the imported Technogym /
Panatta range (Италия) hides its price behind "Цена по запросу" and sells through a `QuoteRequest`
lead (`/api/quote-requests`, listed at `/admin/quote-requests`). The rule is enforced at three
independent layers and all three must hold: `toDTO` zeroes `priceCents` so the figure never reaches
the browser (RSC payload, `GET /api/products`, the persisted compare store); `PriceOrRequest` /
`ProductInstallment` in `src/components/ui/Price.tsx` are the single render-time guard; and
`buildOrder` refuses a quote-only line so a stale or hand-edited cart cannot buy one. Leads from
the price-request modal, `/business` and `/contact` (`LeadForm`) all land in `QuoteRequest`
(`source` = product | business | contact) and notify the manager. The admin and
`buildOrder` read Prisma directly, so both still see the real price. Used equipment (`Product.condition` = "used", `src/lib/condition.ts`) is a third case: marked «Б/у» (`UsedBadge`), filterable (`?cond=used`, linked from the nav when any exist), always priced in the admin form, CSV column `condition` (absent column = keep), and `orderLineName` appends «(б/у)» to the order line. `ORIGIN_PRIORITY` in
`src/lib/countries.ts` is the one place that decides which origin leads the catalog — it drives the
default `featured` sort, `getFeaturedProducts` and the category listings.

**Server/client split.** Pages under `src/app` are server components that fetch via `lib/catalog`
and hand DTOs to client components (`CatalogView`, `ProductCard`, `AddToCart`, drawers…).
`src/lib/auth.ts` is `import "server-only"` — never import it from a client component.

**Cart is client-only.** The live cart lives in `src/store/cart-store.ts` (Zustand + `persist` to
localStorage key `movigym-cart`); line identity is `lineKey(productId, variantId)` so the same
product+variant merges. The `Cart`/`CartItem` Prisma models are vestigial — nothing writes them.
Checkout POSTs the client cart to `/api/checkout`, which validates with `checkoutPayloadSchema`,
then **re-reads every line from the database** and passes that catalog to the pure `buildOrder()`
(`src/lib/order.ts`). The `name`/`unitPriceCents` in the request are ignored — a tampered payload
cannot change what an order costs — and `buildOrder` returns a `{ok:false, error}` result when a
product or variant no longer exists (the route answers 409). Orders persist price/name/variant
snapshots in `BASE_CURRENCY` plus the customer's name, phone, delivery method/address and comment;
`OrderItem.productId` is nullable (`SetNull`) so deleting a product never breaks old orders. Every
order starts `PENDING`; the admin moves it through `PAID → SHIPPED → DELIVERED` (or `CANCELLED`)
at `/admin/orders/[id]`. Card data is never collected: payment is either "manual" (manager sends a
link/invoice) or "online" via ЮKassa (`src/lib/payments/`): checkout creates the payment and
redirects; `/api/payments/yookassa` (webhook) and `/checkout/result` re-read the payment from the
ЮKassa API (`syncOrderPayment`) — the webhook body is never trusted. Manager/customer notifications
(`src/lib/notify.ts`, texts in `notify-messages.ts`) run in `after()` and swallow errors. Line
quantity is capped at `MAX_LINE_QUANTITY` (99) in `cart-store.ts`, mirrored by `checkoutItemSchema`.

**Auth is a hand-rolled DB session**, no NextAuth, no middleware. `POST /api/auth/login` verifies
a bcrypt hash and `createSession()` writes a `Session` row plus an httpOnly `movigym_session`
cookie (7 days). Authorization is enforced in two independent places and both must be updated
together: `src/app/admin/layout.tsx` redirects non-ADMINs, and **each** `/api/admin/*` route
handler re-checks the role (`forbidUnlessAdmin()` in `src/lib/auth.ts`, or the older inline
`getCurrentUser()?.role !== "ADMIN"`) and returns 403. A new admin API route without that check is
unprotected. Public POST endpoints (login, register, reset, checkout, leads, subscribe) are
rate-limited per IP by `limitRequest()` (`src/lib/rate-limit.ts`, in-memory — single instance);
public forms also carry a `Honeypot` field and a 152-ФЗ `Consent` checkbox (schemas require it).

**Environment switches vs. store settings.** Infrastructure is env-driven (all in `.env.example`,
table in `README.md`): `SITE_URL`, `ADMIN_*`, `TELEGRAM_*` (incl. `TELEGRAM_API_BASE` relay), `SMTP_*`, `YOOKASSA_*`,
`SITE_INDEXABLE`, `SESSION_COOKIE_SECURE`, `NEXT_PUBLIC_INSTALLMENT_MONTHS` (build-time),
`DEMO_ACCOUNTS` and `DEMO_EXPOSE_RESET_TOKEN` (both must be false publicly — the admin overview
warns when they are on). Business content the owner edits — phone, email, address, hours, legal
details (ИНН/ОГРН), pickup address, socials — lives in the `Setting` table, edited at
`/admin/settings`, read with `getSettings()` (`src/lib/settings.ts`, React-`cache`d, never throws);
the pure shape/defaults/helpers are in `src/lib/settings-shape.ts` (safe for client components).
Telegram and SMTP can also be connected from `/admin/settings` (`TelegramConnect`, `MailConnect`); their secrets live in private `secret.*` Setting rows (`src/lib/telegram-config.ts`, `getSmtpConfig()` in `src/lib/mailer.ts`), never in `StoreSettings`, and env values win. `mailEnabled()` is async. Manager notifications go to `managerEmail()` (`src/lib/notify.ts`): `NOTIFY_EMAIL` env, else the private `secret.notifyEmail` (admin «Куда присылать заказы и заявки» — kept out of `StoreSettings` so the owner's personal address never reaches a page), else the public store email. The Moscow server cannot reach api.telegram.org, so Bot API calls go through the relay `https://notify.sportliner.store` (`tools/telegram-relay/`, a Caddy reverse proxy in Timeweb NL that only accepts the shop's IP and bot) — saved as `secret.telegramApiBase`, or `TELEGRAM_API_BASE`. Telegram messages omit customer contacts unless `secret.telegramIncludeContacts` is on (`managerOrderMessage`/`managerLeadMessage` `{ contacts: false }`); email always gets the full text. Recipients are added only through a one-time `t.me/<bot>?start=<code>` link polled by `/api/admin/telegram/link` (the bot is public — never add chats from raw `getUpdates`); `getUpdates` calls go through `serialUpdates` (409 otherwise). `telegramApi` retries timeouts/5xx (`withRetry`, `src/lib/retry.ts`) because new connections Moscow → relay sometimes stall. The root layout passes settings to `Footer`; `Header` passes the phone to `MobileMenu`.
Both metadata routes are `force-dynamic` on purpose: statically prerendered, they would bake the
build-time env values in and silently ignore the deployment's settings.

**Money and locale.** Prices are integer minor units everywhere (`priceCents` = kopeks,
`priceDeltaCents`, `totalCents`); only `src/lib/format.ts` converts to display strings.
`BASE_CURRENCY` is `RUB` — the catalog, the admin form (`priceRub`) and every order are in roubles.
The selected country (`src/store/locale-store.ts`, persisted as `movigym-locale`, CIS countries
only) drives both the `Intl` locale and a **display-only** conversion: `formatPriceIn(cents,
currency, country)` / `formatInstallmentIn(...)` convert through `DISPLAY_RATES` and prefix the
result with "≈" (rounded reference rates, not a live FX feed). Never convert a value on its way *into* the cart or the checkout
payload — orders are stored in the product's own currency.

**Language.** Russian is the default; English is the secondary option, switched via
`LocaleSwitcher` in the header. The language is its own store field (`language`), independent of
the country. Translations live in `src/i18n/translations.ts` and are read with `useTranslation()`,
so **translated text only renders in client components** — a server component either delegates to a
small client component (`CategoryName`, `CatalogHeader`, `PrimaryNav`, `CollectionsBanner`,
`AccountView`, `AdminHeader`, …) or, for non-reactive `metadata`, uses a Russian literal. Never add
`"use client"` to a page that queries Prisma, awaits `params`, or calls `getCurrentUser` — extract a
child instead.

Helpers worth knowing: `categoryName(locale, slug, dbName)` maps a seeded category slug to its
localized name (DB names are the fallback), `formatProductCount(locale, n)` handles the Russian
1/2/5 declension, and `orderStatusLabel(locale, status)` localizes the `OrderStatus` enum.
`src/i18n/keys.test.ts` scans every `t("…")` literal in `src/` and fails if a key is missing from
either dictionary — that is what catches a typo'd key before it reaches the screen.

**Hydration.** Anything that renders persisted client state (cart, locale) must match the server
markup on the first client render. Use `useHydrated()` from `src/lib/use-hydrated.ts` (a
`useSyncExternalStore` shim) and render `null` until it is true — not a `setState` in an effect,
which the `react-hooks` lint rules reject.

**Media indirection.** No component hardcodes an asset path. `config/media.json` defines named
slots (`hero`, `productCard`, `logo`, …) with exact dimensions and a `src: null` fallback to an
SVG placeholder in `public/placeholders/`; `src/lib/media.ts` resolves them. Swapping in real
assets means editing `media.json`, not components (see the size table in `README.md`).

**Routing groups.** `src/app/(shop)` = PLP/PDP/search, `src/app/(content)` = marketing pages.
Info and legal pages are data-driven: `src/lib/pages.ts` maps a slug to a function of
`{ settings, onlinePayment }` returning `InfoContent` (sections, `legal`, `contacts`, `form`),
rendered by `InfoPage` via `[page]` (force-dynamic so saved settings show immediately). Legal texts
(privacy/152-ФЗ, offer, returns/ЗоЗПП, terms, cookies) are templates; bump `LEGAL_UPDATED` when
editing them. `src/lib/landings.ts` → `ThemedLanding` (wellness, design).
The shop navigation (mega menu, mobile menu, footer "Товары" column, homepage category grid) is
built from the database: `getShopNav()` in `src/lib/catalog.ts` returns non-empty categories
(ordered by `CATEGORY_ORDER`) and brands, grouped by `src/lib/nav-groups.ts`. Only the static
info links (shipping, contacts, legal…) live in `src/lib/nav.ts`.

**Styling.** Tailwind v4 with no `tailwind.config` — design tokens (`ink`, `paper`, `mist`,
`stone`, `accent`) and shared utilities (`.container-page`, `.hover-lift`) are declared in
`@theme`/CSS in `src/app/globals.css`. Use those tokens instead of raw hex or default palette
colors.

## Testing

Vitest + jsdom, `globals: true`, `@` aliased to `src`, `vitest.setup.ts` shims `localStorage` so
zustand `persist` works. Tests cover pure logic only — `lib/` (format, filter, order, media,
search, csv import, notification texts, rate limiter, settings helpers), `schemas/`,
`store/` (cart, locale, compare) and `i18n/` (dictionary parity, plural/status helpers, and the
key-usage scan). There are no component or route-handler tests and no test DB, so keep business
rules in pure functions in `lib/`/`store/` where they can be tested, rather than inside route
handlers or components.

**Catalog import/export.** `/admin/import` round-trips the catalog through CSV (`src/lib/csv.ts`:
`;`/`,` auto-detect, UTF-8 BOM or Windows-1251 for Excel RU). Import is all-or-nothing, matches by
`slug`, keeps photos/features when those cells are empty, and can delete products missing from the
file. Uploaded photos go to `data/uploads` (`src/lib/uploads.ts`, magic-byte check) and are served
by `src/app/uploads/[name]/route.ts`; `Media` renders hosts outside `OPTIMIZED_HOSTS` unoptimized.
