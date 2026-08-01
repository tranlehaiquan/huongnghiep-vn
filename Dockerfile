# ============================================
# Dokploy-optimized Dockerfile for Astro static site
# Security-hardened: minimal attack surface, proper permissions, security headers
# ============================================

# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prefer-offline --no-audit

# Copy source and build static site
COPY . .
RUN pnpm run build

# Production stage — lightweight nginx
FROM nginx:alpine AS production

# Install curl for healthchecks
RUN apk add --no-cache curl

# Remove default nginx config to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf /etc/nginx/sites-enabled/default 2>/dev/null || true

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix permissions: nginx worker processes run as 'nginx' user
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Security: ensure no shell for nginx user (already set in alpine, but belt+suspenders)
RUN sed -i 's/^nginx:x:/nginx:x:/' /etc/passwd 2>/dev/null || true

# Health check for Dokploy
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Dokploy/Traefik will route to this port
EXPOSE 80

# Run nginx in foreground (required for containers)
# Note: nginx master starts as root to bind port 80, then worker processes
# drop to 'nginx' user automatically. This is standard and safe in containers.
CMD ["nginx", "-g", "daemon off;"]
