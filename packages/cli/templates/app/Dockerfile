# syntax=docker/dockerfile:1

# ---- Stage 1: Base — cài dependencies bằng pnpm ----
FROM node:24-alpine AS base

WORKDIR /app
RUN corepack enable

# Cài dependencies trước để tận dụng cache layer (frozen = tái lập từ pnpm-lock.yaml).
# .npmrc của repo khai báo scope @antadmin → registry nội bộ.
COPY package.json pnpm-lock.yaml .npmrc ./
# Auth registry nội bộ (@antadmin) truyền qua BuildKit secret: mount file .npmrc chứa
# dòng _authToken vào /root/.npmrc — chỉ tồn tại trong lúc RUN, không nằm lại layer/image.
#   CI:    tạo file token rồi build với --secret id=npmrc,src=<file>
#   Local: docker build --secret id=npmrc,src=$HOME/.npmrc .
# cache mount: cache tải gói nằm lại trên host build giữa các lần build.
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm config set store-dir /root/.local/share/pnpm/store && \
    pnpm install --frozen-lockfile

COPY . .

# ---- Stage: Check — lint + typecheck (CI dùng: docker build --target check) ----
FROM base AS check
RUN pnpm check

# ---- Stage 2: Build (nitro node-server output) ----
FROM base AS builder
RUN pnpm build

# ---- Stage 3: Runtime ----
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Chỉ copy output đã build (self-contained, không cần node_modules).
COPY --from=builder /app/.output ./.output

# Chạy bằng user non-root có sẵn trong image.
USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
