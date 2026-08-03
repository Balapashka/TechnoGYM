# SPORT LINER — Demo Fitness Store

> 👉 **Не разработчик? Откройте [НАЧАТЬ-ОТСЮДА.md](НАЧАТЬ-ОТСЮДА.md)** — пошаговая
> инструкция на русском: как запустить сайт, что в нём работает по-настоящему,
> а что имитация. Этот README — техническая документация.

> ⚠️ **Educational demo only.** This store ("SPORT LINER") was built to
> practice modern e-commerce architecture and UX patterns. The catalog names
> real manufacturers and their countries of origin, but **the model codes,
> specifications and prices are all invented** — no listing here is a genuine
> product offer, and the store is not affiliated with any brand it mentions.
> Payments are simulated: the fake card always succeeds and no money moves.

A full-stack e-commerce demo in Russian (English switchable): homepage with hero
+ carousels, category listing with filters and product comparison, product
detail pages with variants, a shopping cart, checkout that creates real orders,
an admin panel for managing the catalog, and a demo login. Prices are in roubles
and are converted for display when you switch country (Россия / Казахстан /
Узбекистан / Кыргызстан).

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma + SQLite · Zustand · Zod + React Hook Form · Vitest.

---

## Run with Docker (recommended — one command)

The whole app (web server + SQLite database, migrations and seed data) runs from
a single `docker compose` command. Nothing else needs to be installed.

### 1. Install Docker

- **Windows / macOS:** install **Docker Desktop** (it includes Docker Compose):
  https://www.docker.com/products/docker-desktop/
  - Windows direct download: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
  - Windows requires WSL 2. If prompted, follow:
    https://learn.microsoft.com/windows/wsl/install
- **Linux:** install Docker Engine + Compose plugin:
  https://docs.docker.com/engine/install/

Verify the installation:

```bash
docker --version
docker compose version
```

### 2. Start the app

From the project folder:

```bash
docker compose up --build
```

Then open **http://localhost:3000**.

On first start the container automatically applies the database migrations,
seeds the mock catalog (~180 products) and creates the demo accounts.

#### Port 3000 already in use?

If you see `Bind for 0.0.0.0:3000 failed: port is already allocated`, pick a
different host port. Create a `.env` file next to `docker-compose.yml` with:

```
APP_PORT=3001
```

Then `docker compose up --build` and open **http://localhost:3001**. Compose
reads `.env` automatically, so this works on Windows, macOS and Linux. (You can
also set it inline on macOS/Linux: `APP_PORT=3001 docker compose up`.)

If a previous run left a half-created container, clear it first with
`docker compose down`.

### 3. Stop the app

```bash
docker compose down
```

The database lives on a named Docker volume (`db-data`), so orders placed and
catalog edits made in the admin panel **survive a restart**. To wipe it and
start from a freshly seeded catalog:

```bash
docker compose down -v
```

---

## Local development (optional, without Docker)

Requires Node.js 22+.

```bash
npm install
cp .env.example .env
npx prisma migrate deploy   # create/update the SQLite schema
npx prisma db seed          # load the mock catalog (skip: prisma/dev.db is pre-seeded)
npm run dev                 # http://localhost:3000
```

A pre-seeded `prisma/dev.db` ships with the repository, so after `npm install`
and `cp .env.example .env` you can go straight to `npm run dev`.

### Useful commands

```bash
npm run check        # everything below, fail-fast, ~10s — run before pushing
npm run dev          # dev server on :3000
npm run build        # production build
npm run start        # serve the production build
npm test             # unit tests (Vitest)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:reset     # drop, re-migrate and re-seed the database
```

`npm run check` runs tests → typecheck → lint → build in that order, stopping at
the first failure (cheapest check first). It is the same set a CI job would run.

### Demo accounts

| Role      | Email                 | Password    | Access                        |
| --------- | --------------------- | ----------- | ----------------------------- |
| Admin     | `admin@movigym.test`  | `admin1234` | `/admin` — manage the catalog |
| Customer  | `demo@movigym.test`   | `demo1234`  | `/account` — order history    |

You can also register a new account at `/register`.

> The `movigym` name in the demo emails, the session cookie and the
> `localStorage` keys is the project's original internal identifier. It is kept
> deliberately so existing sessions and these documented credentials keep
> working; only the customer-facing brand was renamed to SPORT LINER.

Under Docker these two accounts are re-created **and their passwords reset** on
every container start (`scripts/ensure-accounts.mjs`), so the credentials above
always work.

---

## Before you deploy this publicly

The defaults are tuned for a local demo. Review these before putting the app on
a public URL — all of them are environment variables, no code changes needed
(see [`.env.example`](.env.example)).

| Variable                  | Demo default | Public deployment | Why                                                                                                                                     |
| ------------------------- | ------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `DEMO_EXPOSE_RESET_TOKEN` | `true`       | **remove / `false`** | There is no mail server, so the password-reset token is returned in the API response. With it on, anyone who knows an email can take over that account — including the admin. |
| `SESSION_COOKIE_SECURE`   | `false`      | **`true`** (HTTPS)   | Marks the session cookie `Secure`. Must stay `false` on plain HTTP or login breaks.                                                       |
| `SITE_INDEXABLE`          | `false`      | your call            | While `false`, `robots.txt` blocks all crawlers. The catalog names real manufacturers with invented prices, so only enable it once the content is real. |
| `SITE_URL`                | `http://localhost:3000` | your domain | Canonical URL used by `robots.txt`, the sitemap and Open Graph tags.                                                                      |

Also worth knowing before a real launch:

- **Payments are simulated.** `/api/checkout` marks every order `PAID` without a
  payment provider. The card fields are validated (Luhn + expiry) and then
  discarded — card data is never stored.
- **Admin passwords are reset on every Docker start.** Remove the
  `ensure-accounts.mjs` step from `scripts/docker-entrypoint.sh` before running
  with real accounts, or it will keep resetting them to the documented values.
- **SQLite** is fine for a demo and for modest traffic, but switch the Prisma
  datasource to PostgreSQL for a production store.
- **Rate limiting** is not implemented on the login or registration endpoints.

Order integrity is already handled: `/api/checkout` re-reads every product name
and price from the database, so a tampered request cannot change what an order
costs.

---

## Replacing placeholder media

Everything that can't be reproduced (hero video, product photos, etc.) is shown
as an empty placeholder with its exact size baked into the image. To use real
assets, drop a file into `/public` and point the matching slot's `src` in
[`config/media.json`](config/media.json) at it (keep `src: null` to keep the
placeholder). Use the **exact** dimensions below for a clean swap:

| Slot             | Type         | Size (px)   | Aspect | Used for                                   |
| ---------------- | ------------ | ----------- | ------ | ------------------------------------------ |
| `hero`           | video/poster | 1920 × 1080 | 16:9   | Homepage hero background video + poster    |
| `categoryTile`   | image        | 800 × 1000  | 4:5    | "Shop by category" tiles                   |
| `productCard`    | image        | 1000 × 1000 | 1:1    | Product image in carousels and the catalog |
| `productGallery` | image        | 1600 × 1200 | 4:3    | Product detail gallery frames              |
| `lifestyle`      | image        | 1600 × 900  | 16:9   | Lifestyle banner blocks                    |
| `logo`           | image        | 696 × 221   | ~3.1:1 | Brand logo in header/footer (real asset)   |

Example (`config/media.json`):

```json
"hero": {
  "type": "video",
  "width": 1920,
  "height": 1080,
  "placeholder": "/placeholders/hero-1920x1080.svg",
  "src": "/media/my-hero.mp4",
  "note": "..."
}
```

Product photography is separate: `prisma/seed-images.ts` maps each product slug
to a verified Unsplash URL (the host is whitelisted in `next.config.ts`).

---

## Project structure

```
src/
  app/
    (shop)/            # catalog (PLP) and product detail (PDP) pages
    (content)/         # marketing pages, data-driven from lib/pages + lib/landings
    admin/             # admin panel (ADMIN role only)
    api/               # route handlers: auth, checkout, products, admin CRUD
    robots.ts          # crawler rules (gated by SITE_INDEXABLE)
    sitemap.ts         # generated from the catalog
  components/          # layout/, home/, shop/, content/, admin/, ui/, motion/
  lib/                 # prisma client, catalog DTOs, auth, formatting, media, orders
  store/               # zustand stores: cart, locale, compare, UI drawers
  schemas/             # zod schemas: checkout, auth, login, product, newsletter
  i18n/                # ru/en dictionaries + useTranslation
prisma/                # schema.prisma, migrations, seed.ts, pre-seeded dev.db
config/media.json      # media slots for real-asset replacement
scripts/               # docker entrypoint, seeding and demo-account helpers
public/placeholders/   # generated placeholder images
```

## Testing

`npm test` runs the Vitest suite (jsdom). It covers the pure logic — price
formatting, catalog filtering and URL state, order building, the cart / locale /
compare stores, the checkout and auth schemas, the media loader, and a scan that
fails if any `t("…")` key is missing from either translation dictionary.
