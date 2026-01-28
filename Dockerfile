# =========================
# 1. deps：依存関係のインストール
# =========================
FROM node:20-alpine AS deps
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install --frozen-lockfile


# =========================
# 2. builder：Next.jsビルド
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend .

RUN npm run build


# =========================
# 3. runner：本番実行環境
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 本番実行に必要なファイルだけコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
