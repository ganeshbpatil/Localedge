FROM node:20-alpine AS base
RUN apk add --no-cache openssl
RUN npm install -g pnpm@9.15.4
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/ai-gateway/package.json ./packages/ai-gateway/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run db:generate
# Promote @prisma/client and generated .prisma/client to root node_modules so the
# runner stage COPY picks them up as real directories (pnpm symlinks break in the runner).
RUN PRISMA_PKG=$(ls node_modules/.pnpm | grep '^@prisma+client@' | head -1) && \
    mkdir -p node_modules/@prisma && \
    cp -rL node_modules/.pnpm/$PRISMA_PKG/node_modules/@prisma/client node_modules/@prisma/client && \
    mkdir -p node_modules/.prisma && \
    cp -rL node_modules/.pnpm/$PRISMA_PKG/node_modules/.prisma/client node_modules/.prisma/client
RUN pnpm --filter @localedge/api build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
