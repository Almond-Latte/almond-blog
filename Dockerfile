# Dockerfile

# --- Builder ステージ ---
FROM node:18-alpine AS builder
WORKDIR /app
# 依存関係ファイルを先にコピーしてキャッシュを活用
COPY package*.json ./
RUN npm install
# ソースコード全体をコピーしてビルド
COPY . .
RUN npm run build

# --- Runner ステージ ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# production 用依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production
# Builder ステージから必要な成果物をコピー
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]

