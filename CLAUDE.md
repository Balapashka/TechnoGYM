# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Movigym" — an educational, fictional e-commerce demo (Next.js 16 App Router, React 19,
TypeScript, Tailwind v4, Prisma + SQLite, Zustand, Zod, Vitest). All products, copy and media
are mock/placeholder by design — keep new content generic and unbranded.

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

**Server/client split.** Pages under `src/app` are server components that fetch via `lib/catalog`
and hand DTOs to client components (`CatalogView`, `ProductCard`, `AddToCart`, drawers…).
`src/lib/auth.ts` is `import "server-only"` — never import it from a client component.

**Cart is client-only.** The live cart lives in `src/store/cart-store.ts` (Zustand + `persist` to
localStorage key `movigym-cart`); line identity is `lineKey(productId, variantId)` so the same
product+variant merges. The `Cart`/`CartItem` Prisma models are vestigial — nothing writes them.
Checkout POSTs the client cart to `/api/checkout`, which validates with `checkoutPayloadSchema`,
builds the order via the pure `buildOrder()` (`src/lib/order.ts`) and persists an `Order` with
price/name snapshots, always `PAID` (the fake card always succeeds).

**Auth is a hand-rolled DB session**, no NextAuth, no middleware. `POST /api/auth/login` verifies
a bcrypt hash and `createSession()` writes a `Session` row plus an httpOnly `movigym_session`
cookie (7 days). Authorization is enforced in two independent places and both must be updated
together: `src/app/admin/layout.tsx` redirects non-ADMINs, and **each** `/api/admin/*` route
handler re-checks `getCurrentUser()?.role !== "ADMIN"` and returns 403. A new admin API route
without that check is unprotected.

**Money and locale.** Prices are integer cents everywhere (`priceCents`, `priceDeltaCents`,
`totalCents`); only `src/lib/format.ts` converts to display strings. The selected country
(`src/store/locale-store.ts`, persisted as `movigym-locale`, CIS countries only) drives the `Intl`
formatting locale — display only, no FX conversion, so prices stay in the currency stored on the
product.

**Language.** Russian is the default; English is the secondary option, switched via
`LocaleSwitcher` in the header. The language is its own store field (`language`), independent of
the country. Translations live in `src/i18n/translations.ts` and are read with `useTranslation()`,
so **translated text only renders in client components** — a server component either delegates to a
small client component (`CategoryName`, `CatalogHeader`, `PrimaryNav`) or falls back to
`DEFAULT_LOCALE`. Category names are English in the DB, so `categoryName(locale, slug, dbName)`
maps the seeded slug to its localized name. Adoption is partial: header, footer, catalog, cart and
checkout are translated; marketing pages (`lib/pages.ts`, `lib/landings.ts`) are not.

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
zustand `persist` works. Tests cover pure logic only — `lib/` (format, filter, order, media) and
`store/` (cart, locale, compare). There are no component or route-handler tests and no test DB, so
keep business rules in pure functions in `lib/`/`store/` where they can be tested, rather than
inside route handlers or components.
