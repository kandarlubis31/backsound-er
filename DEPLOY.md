# 🚀 VPS Deployment Checklist — backsound-er

## Prasyarat
- VPS dengan **Docker** & **Docker Compose** terinstall
- **Node.js 20+** dan **pnpm** terinstall
- Port **3000** terbuka (atau sesuaikan)

---

## 1. Clone & Install

```bash
git clone <repo-url> backsound-er
cd backsound-er
pnpm install
```

---

## 2. Setup Database & Environment

```bash
# Bikin .env
cat > apps/web/.env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/backsounder
EOF

# Jalanin PostgreSQL via Docker
docker compose up -d

# Tunggu 3-5 detik biar DB siap, lalu migrate + generate Prisma
cd apps/web
npx prisma migrate dev --name add_scrape_log
npx prisma generate
cd ../..
```

---

## 3. Build & Run

```bash
cd apps/web
npx next build
npx next start -p 3000
```

Atau pake **PM2** biar persistent:

```bash
pm2 start npx --name backsounder -- next start -p 3000 --dir apps/web
pm2 save
```

---

## 4. Scrape Data

1. Buka browser → `http://<vps-ip>:3000`
2. Klik tombol **"Scrape"** di navbar kanan atas
3. Tunggu 1-5 menit (scrape 6 halaman myinstants.com)
4. Refresh homepage — sounds langsung muncul!

🔁 **Cooldown:** 24 jam antar scrape. Tombol akan show countdown.

---

## Environment Variables

| Variable       | Deskripsi                    | Default                                                         |
|----------------|------------------------------|-----------------------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/backsounder`     |

---

## Struktur File Penting

```
backsound-er/
├── docker-compose.yml          # PostgreSQL service
├── apps/web/
│   ├── .env                    # DATABASE_URL (bikin sendiri)
│   ├── prisma/schema.prisma    # DB schema (Category, Sound, ScrapeLog)
│   ├── public/sounds/          # MP3 files hasil scrape (auto-created)
│   ├── next.config.ts
│   └── package.json
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Database connection refused" | `docker compose up -d` dulu, tunggu 5 detik |
| "Scrape gagal" | Cek koneksi internet VPS, klik ulang tombol scrape |
| "useSearchParams() should be wrapped..." | Udah difix ✅, gak bakal muncul |
| Port 3000 gak bisa diakses | Cek firewall: `ufw allow 3000` |
| React Query devtools error | Udah diremove ✅ |

---

## Update App dari Repo

```bash
cd backsound-er
git pull
pnpm install
cd apps/web
npx prisma generate
npx next build
pm2 restart backsounder   # kalo pake PM2
```
