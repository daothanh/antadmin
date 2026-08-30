# Getting Started

## Tạo project mới

Dùng CLI để scaffold đúng chuẩn:

```bash
npx @antadmin/cli antadmin-orders
cd antadmin-orders
cp .env.example .env
pnpm install
pnpm dev
```

Project sinh ra đã `extends ['@antadmin/nuxt-layer-base']`, có `.npmrc` trỏ registry `@antadmin`,
`tsconfig`/`eslint` chuẩn, và CI/CD sẵn dùng (`.gitlab-ci.yml` + `Dockerfile` +
`docker-compose.*.yml` + `scripts/deploy-prod.sh`) — xem [Deploy](/guide/deploy).

## Cấu hình môi trường

```bash
# .env
NUXT_SESSION_SECRET=            # BẮT BUỘC ở prod (>= 32 ký tự): openssl rand -base64 32
NUXT_AUTH_BASE_URL=https://api.antadmin.com/cop   # cổng IAM (bọc /iam + /auth)
NUXT_API_PROXY_TARGET=https://gateway.antadmin.vn

# Dev không có IAM:
# NUXT_AUTH_MOCK=true
```

Chi tiết endpoint/mapping/phương thức xác thực: xem [Auth & Permission](/guide/auth).

## Thêm vào project có sẵn

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@antadmin/nuxt-layer-base'],
  compatibilityDate: '2025-01-01',
})
```

```ini
# .npmrc
@antadmin:registry=https://github.com/api/v4/packages/npm/
```

## Trang đầu tiên

```vue
<script setup lang="ts">
definePageMeta({ permissions: ['order.read'] })
const api = useApi()
const { dataSource, loading, pagination, onChange } = useTable(
  (q) => api('/orders', { query: q }),
)
</script>

<template>
  <CTable :data-source="dataSource" :loading="loading" :pagination="pagination" @change="onChange" />
</template>
```
