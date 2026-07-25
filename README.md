# SPORT LINER — Demo Fitness Store

> ⚠️ **Educational demo only.** This store ("SPORT LINER") was built to
> practice modern e-commerce architecture and UX patterns. The catalog names
> real manufacturers and their countries of origin, but **the model codes,
> specifications and prices are all invented** — no listing here is a genuine
> product offer, and the store is not affiliated with any brand it mentions.

A full-stack e-commerce demo in Russian (English switchable): homepage with hero
+ carousels, category listing with filters and product comparison, product
detail pages with variants, a shopping cart, checkout that creates real orders,
and a demo login. Prices are in roubles and are converted for display when you
switch country (Россия / Казахстан / Узбекистан / Кыргызстан).

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma + SQLite ·
Zustand · Zod + React Hook Form · Vitest.

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

On first start the container automatically applies the database migrations and
seeds the mock catalog.

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

To also delete the stored database (start fresh next time):

```bash
docker compose down -v
```

---

## Local development (optional, without Docker)

Requires Node.js 22+.

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init   # create the SQLite DB
npx prisma db seed                   # load the mock catalog
npm run dev                          # http://localhost:3000
```

### Tests

All business logic (cart, locale/country switching, product comparison, price
formatting, filtering/sorting, checkout schemas, order building, media loader)
is covered by unit tests:

```bash
npm test
```

### Demo login

Email `demo@movigym.test` · password `demo1234`.

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

---

## Project structure

```
src/
  app/                 # routes: home, category (PLP), product (PDP), cart, checkout, login, api/*
  components/          # layout/, home/, shop/, ui/
  lib/                 # prisma client, catalog, formatting, filtering, media loader, order logic
  store/               # zustand stores: cart, locale, compare
  schemas/             # zod schemas: checkout, login, newsletter
prisma/                # schema.prisma + seed.ts
config/media.json      # media slots for real-asset replacement
public/placeholders/   # generated placeholder images
```
