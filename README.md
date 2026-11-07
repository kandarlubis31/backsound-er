# Backsound-er

A browsable catalog of background sounds for video and web work. Sounds are grouped
into categories, searchable, tagged, and attributed back to their source. A built-in
scraper fills the catalog and records what each run found.

Next.js front end, Prisma on PostgreSQL, everything served from one app.

## What is in the app

| Area | Behaviour |
| :--- | :--- |
| Home | Category overview and recent sounds |
| Categories | Browse by category, each with icon and slug |
| Search | Full-text style search across name and tags |
| Player | Plays a sound from its `audioUrl`, increments `playCount` |
| Stats | Play and inventory counts |
| Scraper | Walks a source, stores new sounds, skips duplicates, logs each run |

## Data model

Three tables, defined in [`apps/web/prisma/schema.prisma`](apps/web/prisma/schema.prisma):

- **`Category`** — name, unique slug, optional icon
- **`Sound`** — name, unique slug, description, `audioUrl`, duration, file size,
 `playCount`, `sourceUrl`, emoji, tags, category relation
- **`ScrapeLog`** — status, counts for found/added/skipped, page cursor, error, timings

`Sound` is indexed on `categoryId`, `playCount` (descending), and `name`.

## Requirements

- Node.js 20+
- pnpm
- PostgreSQL

## Setup

```bash
cd apps/web
pnpm install
cp .env.example .env      # then fill in DATABASE_URL
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

`pnpm dev` starts the Next.js dev server on its default port (3000). Pass a
 different one with `pnpm dev -- -p 9000`.

## Scripts

Run inside `apps/web`:

| Command | Purpose |
| :--- | :--- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

## API routes

| Route | Purpose |
| :--- | :--- |
| `/api/categories` | Category list and lookups |
| `/api/sounds` | Sound list, detail, and play counter |
| `/api/search` | Query sounds by name and tags |
| `/api/stats` | Aggregate counts |
| `/api/scrape` | Run the scraper and write a `ScrapeLog` entry |

## Layout

```
apps/web/
  src/app/         routes: home, categories, search, api/*
  src/components/  ui, layout, sound, category, scrape, shared
  src/generated/   Prisma client output
  prisma/          schema and migrations
  public/          static assets
  Dockerfile       container build
.env.example       root-level template shared with the app
```

## Notes

- `apps/web/.env` holds local credentials and must not be committed.

---

## Bahasa Indonesia

**Backsound-er** adalah katalog backsound untuk kebutuhan video dan web yang bisa ditelusuri: suara dikelompokkan per kategori, bisa dicari, diberi tag, dan tetap mencantumkan sumbernya. Scraper bawaan mengisi katalog dan mencatat apa yang ditemukan setiap kali dijalankan.

---

## License

See the repository root for licensing terms.
