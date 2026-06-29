# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy root workspace files and web app package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy all files from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./

# Copy the web app source
COPY apps/web ./apps/web

# Generate Prisma client and build Next.js
RUN cd apps/web && npx prisma generate && npx next build

# ---- Stage 3: Production runner ----
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy Prisma generated client and schema for runtime
COPY --from=builder /app/apps/web/src/generated ./apps/web/src/generated
COPY --from=builder /app/apps/web/node_modules/.prisma ./apps/web/node_modules/.prisma

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 9000

ENV PORT=9000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
