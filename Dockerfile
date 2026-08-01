# ============================================
# Dokploy-optimized Dockerfile for Astro static site
# ============================================

# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --prefer-offline --no-audit

# Copy source and build static site
COPY . .
RUN npm run build

# Production stage — lightweight nginx
FROM nginx:alpine AS production

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check for Dokploy
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Dokploy/Traefik will route to this port
EXPOSE 80

# Run nginx in foreground (required for containers)
CMD ["nginx", "-g", "daemon off;"]
