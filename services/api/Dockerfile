# Build stage
FROM node:20-alpine AS builder

WORKDIR /build

# Install dependencies
RUN apk add --no-cache python3 make g++

# Copy monorepo files
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY services/api ./services/api
COPY packages ./packages

# Install with pnpm
RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm build --filter @allied/api

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for graceful shutdown
RUN apk add --no-cache dumb-init

# Copy built application
COPY --from=builder /build/services/api/dist ./dist
COPY --from=builder /build/services/api/package.json ./
COPY --from=builder /build/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
