# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"SPORT LINER" — an educational e-commerce demo (Next.js 16 App Router, React 19, TypeScript,
Tailwind v4, Prisma + SQLite, Zustand, Zod, Vitest). All products, copy and media are
mock/placeholder by design; the logo is the only real asset. The brand name lives in
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

docker compose up --build   # full stack; entrypoint migrates + seeds + ensures demo accounts
```

First-time local setup: `npm install` → `cp .env.example .env` → `npx prisma migrate dev` →
`npx prisma db seed`. `postinstall` runs `prisma generate`, so the client is regenerated on install;
after editing `prisma/schema.prisma` run a migration (or at least `npx prisma generate`) manually.

Demo accounts (recreated on every Docker start by `scripts/ensure-accounts.mjs`, which **resets
their passwords/roles each boot**): `admin@movigym.test` / `admin1234` (ADMIN),
`demo@movigym.test` / `demo1234` (USER).

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

**Catalog data.** `prisma/seed.ts` generates ~180 products across 10 equipment categories,
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
`buildOrder` refuses a quote-only line so a stale or hand-edited cart cannot buy one. The admin and
`buildOrder` read Prisma directly, so both still see the real price. `ORIGIN_PRIORITY` in
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
product or variant no longer exists (the route answers 409). Orders persist price/name snapshots in
`BASE_CURRENCY`, always `PAID` (the fake card always succeeds). Line quantity is capped at
`MAX_LINE_QUANTITY` (99) in `cart-store.ts`, mirrored by `checkoutItemSchema`.

**Auth is a hand-rolled DB session**, no NextAuth, no middleware. `POST /api/auth/login` verifies
a bcrypt hash and `createSession()` writes a `Session` row plus an httpOnly `movigym_session`
cookie (7 days). Authorization is enforced in two independent places and both must be updated
together: `src/app/admin/layout.tsx` redirects non-ADMINs, and **each** `/api/admin/*` route
handler re-checks `getCurrentUser()?.role !== "ADMIN"` and returns 403. A new admin API route
without that check is unprotected.

**Environment switches.** Behaviour that differs between the local demo and a public deployment is
env-driven, never hardcoded (all listed in `.env.example`, table in `README.md`):
`DEMO_EXPOSE_RESET_TOKEN` returns the password-reset token in the API response (no mail server —
must be off publicly, or any email is an account takeover), `SESSION_COOKIE_SECURE` marks the
session cookie `Secure` (must stay off on plain HTTP or login breaks), and `SITE_INDEXABLE` /
`SITE_URL` drive `src/lib/site.ts`, which feeds `metadataBase`, `app/robots.ts` and `app/sitemap.ts`.
Both metadata routes are `force-dynamic` on purpose: statically prerendered, they would bake the
build-time env values in and silently ignore the deployment's settings.

**Money and locale.** Prices are integer minor units everywhere (`priceCents` = kopeks,
`priceDeltaCents`, `totalCents`); only `src/lib/format.ts` converts to display strings.
`BASE_CURRENCY` is `RUB` — the catalog, the admin form (`priceRub`) and every order are in roubles.
The selected country (`src/store/locale-store.ts`, persisted as `movigym-locale`, CIS countries
only) drives both the `Intl` locale and a **display-only** conversion: `formatPriceIn(cents,
currency, country)` / `formatInstallmentIn(...)` convert through the `DEMO_RATES` table (rounded
stand-ins, not a real FX feed). Never convert a value on its way *into* the cart or the checkout
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

**Routing groups.** `src/app/(shop)` = PLP/PDP, `src/app/(content)` = marketing pages. Content
pages are data-driven, not per-page components: `src/lib/pages.ts` (`infoPages` → generic
`InfoPage`, statically generated via `[page]`) and `src/lib/landings.ts` (`landings` → richer
`ThemedLanding`). Adding a marketing page usually means adding a key to one of those maps.
Header/footer navigation is static config in `src/lib/nav.ts` — its hrefs must match seeded
category slugs (see `prisma/seed.ts`), which are also the keys of `src/lib/category-color.ts`.

**Styling.** Tailwind v4 with no `tailwind.config` — design tokens (`ink`, `paper`, `mist`,
`stone`, `accent`) and shared utilities (`.container-page`, `.hover-lift`) are declared in
`@theme`/CSS in `src/app/globals.css`. Use those tokens instead of raw hex or default palette
colors.

## Testing

Vitest + jsdom, `globals: true`, `@` aliased to `src`, `vitest.setup.ts` shims `localStorage` so
zustand `persist` works. Tests cover pure logic only — `lib/` (format, filter, order, media),
`store/` (cart, locale, compare) and `i18n/` (dictionary parity, plural/status helpers, and the
key-usage scan). There are no component or route-handler tests and no test DB, so keep business
rules in pure functions in `lib/`/`store/` where they can be tested, rather than inside route
handlers or components.
