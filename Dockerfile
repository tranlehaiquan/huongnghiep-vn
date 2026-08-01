# ============================================
# Dokploy-optimized Dockerfile for Astro SSR (Node.js Standalone)
# ============================================

# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --prefer-offline

# Copy source and build SSR bundle
COPY . .
RUN pnpm run build

# Production stage — Node.js runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 80

CMD ["node", "./dist/server/entry.mjs"]
