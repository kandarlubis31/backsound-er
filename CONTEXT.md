# backsound-er — Project Context

## Ringkasan

Katalog backsound untuk kebutuhan video dan web. Suara dikelompokkan per kategori, bisa dicari,
diberi tag, dan selalu menyertakan atribusi ke sumbernya. Pengisi katalog adalah scraper bawaan yang
mencatat setiap kali dijalankan.

Monorepo pnpm; aplikasi utama ada di `apps/web` (Next.js + Prisma + PostgreSQL).

## Model data

- **Sound** — nama, `audioUrl`, kategori, tag, sumber/atribusi, `playCount`.
- **Category** — nama, slug, ikon.
- **ScrapeLog** — hasil tiap kali scraper dijalankan: berapa ditemukan, berapa baru, berapa dilewati.

`playCount` dinaikkan setiap kali pemutar memutar suara, jadi statistik pemakaian datang dari
penggunaan nyata, bukan tebakan.

## Halaman

| Area | Isi |
| :--- | :--- |
| Home | Ringkasan kategori dan suara terbaru |
| Categories | Telusuri per kategori (slug) |
| Search | Cari pada nama dan tag |
| Player | Putar `audioUrl`, tambah `playCount` |
| Stats | Jumlah putar dan isi katalog |

Scraper berjalan dari perintah terpisah (`scrape`), bukan dari request pengguna, supaya tidak ada
penjelajahan situs lain yang dipicu trafik publik. Duplikat dilewati berdasarkan URL sumber.

## Struktur

```
apps/web/            Next.js: halaman, komponen, Prisma schema
docker-compose.yml   PostgreSQL lokal
pnpm-workspace.yaml  Daftar workspace
DEPLOY.md            Langkah deploy
plan.md              Rencana pengembangan
```

## Menjalankan

```bash
cp .env.example .env      # DATABASE_URL
docker compose up -d      # PostgreSQL
pnpm install
pnpm dev
pnpm scrape               # isi katalog
```

## Catatan

- Atribusi sumber wajib ikut tersimpan; jangan menghapusnya saat menambah data manual.
- Scraper menulis ke basis data yang sama dengan aplikasi, jadi jalankan saat trafik rendah.
