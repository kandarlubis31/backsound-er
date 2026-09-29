# web — Project Context

## Ringkasan
This is a Next.js project bootstrapped with create-next-app . First, run the development server: Open http://localhost:9000 with your browser to see the result. You can start editing the page by modifying app/page.tsx . The page auto-updates as you edit the file. This project uses next/font to automatically optimize and load Geist, a new font family for Vercel.

> *Context ini dibuat otomatis oleh `catalog/generate_contexts.py`. Isi ulang
> bagian ringkasan / arsitektur secara manual jika butuh detail lebih dalam.*

## Tech Stack
Node.js; deps: @base-ui/react, @prisma/adapter-pg, @prisma/client, @tanstack/react-query, cheerio, class-variance-authority, clsx, framer-motion; dev: @tailwindcss/postcss, @types/cheerio, @types/node, @types/react, @types/react-dom; Docker

## Struktur Utama
```
prisma/
public/
src/
.env
.env.example
.gitignore
AGENTS.md
CLAUDE.md
components.json
CONTEXT.md
Dockerfile
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
pnpm-lock.yaml
postcss.config.mjs
prisma.config.ts
README.md
tsconfig.json
tsconfig.tsbuildinfo
```

## Cara Menjalankan
- `npm run dev`
- `npm run start`
- `npm run build`

---

*Generated: 2026-08-08 · Path: nodeJS\backsound-er\apps\web*
