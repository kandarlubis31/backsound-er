# 🎵 backsound-er — Project Plan v2

> Clone of [myinstants.com](https://www.myinstants.com) — public soundboard web app with full scraping, instant play+download UI, and self-hosted audio.
> **No login. No accounts. Just sounds.**

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Data Model / Database Schema](#3-data-model--database-schema)
4. [Scraping Strategy](#4-scraping-strategy)
5. [Project Structure](#5-project-structure)
6. [Backend Architecture](#6-backend-architecture)
7. [Frontend Architecture & UI](#7-frontend-architecture--ui)
8. [Local Development Setup](#8-local-development-setup)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Future: Deployment Notes](#10-future-deployment-notes)

---

## 1. Project Overview

Membuat web soundboard publik seperti myinstants.com dengan:
- ✅ Scrape **SEMUA sound** (~10,000+ sounds) dari myinstants.com
- ✅ **Download button langsung** di homepage — gak perlu masuk detail page
- ✅ **Next.js** frontend dengan UI modern, dark mode, mobile responsive
- ✅ **Search + Filter** by nama & kategori
- ✅ **Category browsing**
- ✅ **Play count tracking** (anonymous)
- ✅ **LocalStorage favorites** (gak perlu login)
- ✅ **Share button** untuk share sound
- ✅ **Self-hosted** audio files (local development dulu)
- ❌ ~~User authentication~~ — dihapus, web publik 100%
- ❌ ~~Custom soundboards~~ — dihapus (butuh auth)
- ❌ ~~Admin panel~~ — manage via Prisma Studio / DB langsung
- ❌ ~~Deploy production~~ — fokus local dev dulu

---

## 2. Tech Stack

### Core
| Tech | Justification |
|------|---------------|
| **Node.js 20 LTS** | Runtime utama |
| **Next.js 14 (App Router)** | Full-stack framework — SSR/SSG/API routes |
| **TypeScript** | Type safety |
| **Prisma ORM** | Type-safe database, migrations |
| **PostgreSQL 16** | Database suara terstruktur, di Docker |
| **pnpm** | Fast package manager + monorepo workspaces |

### Frontend
| Tech | Justification |
|------|---------------|
| **Next.js 14 (React 18)** | SSR + App Router |
| **Tailwind CSS 3** | Utility-first, dark mode |
| **shadcn/ui** | Accessible UI components |
| **Framer Motion** | Animations |
| **React Query (TanStack)** | Data fetching & caching |
| **Zustand** | Audio player state |
| **next-themes** | Dark/light mode |
| **Lucide Icons** | Icons |

### Scraping
| Tech | Justification |
|------|---------------|
| **axios** | HTTP client |
| **cheerio** | HTML parser |
| **p-limit** | Concurrency control |
| **node:fs / node:stream** | Download audio |

### Dev Tools
| Tech | Justification |
|------|---------------|
| **Docker + Docker Compose** | PostgreSQL local |
| **ESLint + Prettier** | Code quality |
| **Git** | Version control |

---

## 3. Data Model / Database Schema

> **Simplified** — no users, no favorites table, no soundboards.

### Prisma Schema

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  icon      String?            // emoji atau icon name
  sounds    Sound[]
  createdAt DateTime @default(now())
}

model Sound {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  description String?
  audioUrl    String            // path: /audio/{slug}.mp3
  duration    Float?            // detik
  fileSize    Int?              // bytes
  playCount   Int      @default(0)
  sourceUrl   String?           // URL asli di myinstants
  emoji       String?           // emoji untuk UI card
  tags        String[]          // PostgreSQL text array
  categoryId  Int
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([playCount(sort: Desc)])
  @@index([name])
}
```

### Client-side Storage (localStorage)

```ts
// Favorites: array of sound IDs
localStorage key: "backsound-favorites"
value: [1, 45, 230, 891]

// Recently Played: array of { soundId, playedAt }
localStorage key: "backsound-history"
value: [{soundId: 45, playedAt: "2026-06-29T..."}, ...]
```

---

## 4. Scraping Strategy

### Discovery
1. **Sitemap Index**: `https://www.myinstants.com/sitemap.xml` → list `.xml.gz`
2. **Unzip & Parse**: Dapatkan semua URL sound detail pages
3. **Volume**: ~10,000–15,000 sounds

### Per-Sound Scraping
1. **Fetch HTML** (`axios` + user-agent)
2. **Parse HTML** (`cheerio`):
   - Name, slug, category, audio URL, description, tags, play count
3. **Download audio** (stream to `/public/audio/`)
4. **Insert ke DB** (Prisma upsert)

### Rate Limiting
```js
CONCURRENCY = 3        // Max parallel
DELAY = 1500           // ms antar request
USER_AGENT = 'backsound-er/1.0 (soundboard aggregator)'
```

### Workflow
```
1. Fetch sitemap.xml → list .gz
2. Extract all sound URLs → urls.json
3. For each URL:
   a. Fetch + parse detail page
   b. Download .mp3
   c. Upsert ke DB
4. Resume support via progress.json
```

---

## 5. Project Structure

```
backsound-er/
├── package.json                    # Root workspace
├── pnpm-workspace.yaml
├── plan.md
├── .env.example
├── .gitignore
├── docker-compose.yml              # PostgreSQL only
│
├── apps/
│   └── web/                        # Next.js App
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── public/
│       │   └── audio/              # Downloaded .mp3 files (.gitignored)
│       └── src/
│           ├── app/
│           │   ├── layout.tsx      # Root layout + providers
│           │   ├── page.tsx        # Homepage (trending + new)
│           │   ├── loading.tsx
│           │   ├── error.tsx
│           │   ├── not-found.tsx
│           │   │
│           │   ├── categories/
│           │   │   ├── page.tsx    # All categories
│           │   │   └── [slug]/
│           │   │       └── page.tsx# Category detail
│           │   │
│           │   ├── search/
│           │   │   └── page.tsx    # Search results
│           │   │
│           │   ├── sound/
│           │   │   └── [slug]/
│           │   │       └── page.tsx# Sound detail (optional)
│           │   │
│           │   └── api/
│           │       ├── sounds/
│           │       │   ├── route.ts       # GET list (paginated, filterable)
│           │       │   └── [id]/
│           │       │       ├── route.ts   # GET single
│           │       │       └── play/
│           │       │           └── route.ts  # POST increment play
│           │       ├── categories/route.ts
│           │       ├── search/route.ts
│           │       └── stats/route.ts
│           │
│           ├── components/
│           │   ├── ui/             # shadcn/ui
│           │   ├── layout/
│           │   │   ├── navbar.tsx
│           │   │   ├── footer.tsx
│           │   │   └── search-bar.tsx
│           │   ├── sound/
│           │   │   ├── sound-card.tsx      # Play + download + share
│           │   │   ├── sound-grid.tsx
│           │   │   ├── audio-player.tsx    # Global bottom player
│           │   │   └── download-button.tsx
│           │   ├── category/
│           │   │   ├── category-card.tsx
│           │   │   └── category-pills.tsx
│           │   └── shared/
│           │       ├── share-button.tsx
│           │       ├── favorite-button.tsx   # localStorage-based
│           │       ├── infinite-scroll.tsx
│           │       ├── skeleton-card.tsx
│           │       └── empty-state.tsx
│           │
│           ├── lib/
│           │   ├── prisma.ts
│           │   ├── utils.ts
│           │   ├── constants.ts
│           │   └── validations.ts
│           │
│           ├── hooks/
│           │   ├── use-sounds.ts
│           │   ├── use-favorites.ts       # localStorage
│           │   ├── use-audio-player.ts
│           │   └── use-debounce.ts
│           │
│           ├── stores/
│           │   └── audio-store.ts         # Zustand
│           │
│           ├── providers/
│           │   ├── theme-provider.tsx
│           │   └── query-provider.tsx
│           │
│           └── types/
│               └── index.ts
│
└── packages/
    └── scraper/
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── sitemap.ts
            ├── scraper.ts
            ├── downloader.ts
            ├── parser.ts
            ├── db.ts
            ├── progress.ts
            └── utils.ts
```

---

## 6. Backend Architecture

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/sounds` | List sounds — paginated, `?category=&sort=popular\|new&page=&limit=` |
| `GET` | `/api/sounds/[id]` | Single sound detail |
| `POST` | `/api/sounds/[id]/play` | Increment play count |
| `GET` | `/api/categories` | All categories + sound counts |
| `GET` | `/api/search?q=&category=&page=` | Full-text search sounds |
| `GET` | `/api/stats` | Total sounds, categories, total plays |

### Data Flow
```
User Action → React Query Hook → API Route → Prisma → PostgreSQL
     ↑                                                    |
     └──────── JSON Response ─────────────────────────────┘
```

### Audio Serving
- Dev: `next dev` serves `/public/audio/` automatically
- Files organized as `audio/{slug}.mp3`

### Caching
- React Query client cache (stale time ~5 min)
- ISR untuk homepage (`revalidate: 3600`)

---

## 7. Frontend Architecture & UI

### Design Philosophy
> **"Download-first, play-instantly."** — Semua aksi langsung dari sound card.

### Homepage Layout
```
┌─────────────────────────────────────────────────────┐
│  🎵 backsound-er          [🔍 Search...] [🌙]       │
├─────────────────────────────────────────────────────┤
│  🏷️ [Semua] [Memes] [Gaming] [Anime] [Prank] ...  │
│                                                     │
│  🔥 Trending                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │  💥  │ │  🔥  │ │  💨  │ │  😱  │ │  🤡  │    │
│  │ Vine │ │ Bruh │ │ Fart │ │ FAQ  │ │ Clown│    │
│  │ Boom │ │      │ │      │ │ AAAH │ │ Horn │    │
│  │ ▶️⬇️♥️│ │ ▶️⬇️♥️│ │ ▶️⬇️♥️│ │ ▶️⬇️♥️│ │ ▶️⬇️♥️│    │
│  │ 1.2M │ │890K  │ │450K  │ │ 2.1M │ │340K  │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│                                                     │
│  🆕 Terbaru                                        │
│  [Same grid...]                                     │
│                                                     │
│  [Load More]                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🔊 Vine Boom  ─────●────── 0:02  ⏸  🔊    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Sound Card (Core Component)
```tsx
<SoundCard sound={sound}>
  <Emoji emoji="💥" />
  <Name name="Vine Boom" />
  <PlayButton />           {/* ▶️ Play/Pause dengan progress ring */}
  <DownloadButton />       {/* ⬇️ Download langsung tanpa detail page */}
  <FavoriteButton />       {/* ♥️ Toggle (localStorage) */}
  <ShareButton />          {/* 📤 Copy link / sosmed */}
  <PlayCount count="1.2M" />
</SoundCard>
```

### Key Features
1. **Global Audio Player** — floating bottom bar, pause/play
2. **Infinite Scroll** — load more auto
3. **Instant Search** — debounced, no page reload
4. **Download langsung** — click download button di card, langsung jalan
5. **Favorite (localStorage)** — klik heart, simpen di browser
6. **Share** — copy link ke clipboard
7. **Dark/Light mode** — toggle + system preference
8. **Keyboard shortcuts** — Space=play/pause, Ctrl+K=search
9. **Skeleton loading** — animasi placeholder
10. **Responsive** — 5 cols → 3 → 2

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Hero search + category pills + trending + new sounds |
| Categories | `/categories` | All categories grid |
| Category | `/categories/[slug]` | Sounds in category, filterable |
| Search | `/search?q=` | Search results |
| Sound Detail | `/sound/[slug]` | (optional) detail + related sounds |

---

## 8. Local Development Setup

### Prerequisites
- Node.js 20 LTS
- pnpm (`npm install -g pnpm`)
- Docker Desktop (or Docker Engine)
- Git

### Quick Start
```bash
# 1. Clone / init repo
cd backsound-er

# 2. Install deps
pnpm install

# 3. Start PostgreSQL
docker compose up -d

# 4. Setup env
cp .env.example .env

# 5. Run migrations
cd apps/web
npx prisma migrate dev

# 6. Start dev
pnpm dev
# → http://localhost:3000
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: backsounder-db
    environment:
      POSTGRES_DB: backsounder
      POSTGRES_USER: backsounder
      POSTGRES_PASSWORD: backsounder
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Environment
```env
# .env.example
DATABASE_URL="postgresql://backsounder:backsounder@localhost:5432/backsounder"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 9. Implementation Roadmap

### Phase 0: Project Setup (Day 1)
- [ ] Init monorepo (pnpm workspaces)
- [ ] Init Next.js + TypeScript + Tailwind
- [ ] Setup Prisma + create schema + migration
- [ ] Setup Docker Compose PostgreSQL
- [ ] Setup shadcn/ui + theme provider
- [ ] Setup ESLint, Prettier
- [ ] Init Git repo

### Phase 1: Database & Scraper (Day 2-3)
- [ ] Build sitemap parser (URL extraction)
- [ ] Build HTML parser (cheerio)
- [ ] Build audio downloader
- [ ] Build DB inserter (Prisma)
- [ ] Run scraper → populate database
- [ ] Verify data quality

### Phase 2: Core API (Day 3-4)
- [ ] `GET /api/sounds` (paginated list + filters)
- [ ] `GET /api/categories`
- [ ] `GET /api/search`
- [ ] `POST /api/sounds/[id]/play`
- [ ] `GET /api/stats`

### Phase 3: Frontend Core (Day 4-7)
- [ ] Layout: Navbar, Footer, ThemeProvider
- [ ] SoundCard component (play + download + favorite + share)
- [ ] SoundGrid + Infinite Scroll
- [ ] Global Audio Player (bottom bar)
- [ ] Homepage (trending + new + categories)
- [ ] Category pages
- [ ] Search page
- [ ] Favorite (localStorage) + Share

### Phase 4: Polish (Day 7-9)
- [ ] Dark mode fine-tuning
- [ ] Keyboard shortcuts
- [ ] Mobile responsive optimization
- [ ] Skeleton + empty states
- [ ] Performance optimization
- [ ] Loading + error boundaries

### Phase 5: Future (Optional)
- [ ] Sound detail page
- [ ] Audio waveform visualizer
- [ ] Sound submission form
- [ ] Admin panel (Prisma Studio cukup dulu)
- [ ] Deploy production (Nginx + PM2 + SSL)

---

## 10. Future: Deployment Notes

> **Not needed now** — fokus local development. Simpan buat referensi nanti.

```bash
# VPS setup (future)
sudo apt install -y nodejs nginx postgresql
git clone <repo> /opt/backsound-er
pnpm install && pnpm build
pm2 start pnpm --name backsound-er -- start
```

```nginx
# Nginx config (future)
server {
    listen 80;
    server_name _;
    location /audio/ {
        alias /opt/backsound-er/apps/web/public/audio/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

---

## 📊 Resource Estimates (Local Dev)

| Item | Estimate |
|------|----------|
| Sounds DB | ~10,000–15,000 records |
| Categories | ~50–100 |
| DB size | ~5–10 MB |
| Audio files | ~500 MB – 1 GB |
| Docker RAM | ~256 MB (PostgreSQL) |

---

## 🔜 Next Steps

1. ✅ Plan confirmed — no auth, public only
2. **Init project** — monorepo + Next.js + Prisma + Docker
3. **Build scraper** — populate data first
4. **Build UI** — sound cards + player

---

> 📝 *Plan ini living document, di-track di Git.*
