# notipoli-node/Dockerfile
# Multi-stage build for production

# --- Base stage ---
FROM node:20.11-alpine AS base
WORKDIR /app

# --- Dependencies stage ---
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# --- Builder stage (TypeScript compilation) ---
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Runtime stage ---
FROM base AS runner
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create uploads directory
RUN mkdir -p /app/uploads

# Install wget for health check
RUN apk add --no-cache wget

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]