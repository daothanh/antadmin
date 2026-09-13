# CLAUDE.md — __APP_NAME__

App Nuxt 4 dựng trên framework AntAdmin: `extends @antadmin/nuxt-layer-base` là có sẵn theme antdv,
component `C*`, auth IAM/BFF và composables. Ngôn ngữ repo: **tiếng Việt** (comment, commit, docs).
Docs framework: https://daothanh.github.io/antadmin

## Lệnh thường dùng

```bash
pnpm dev          # dev server (cần .env — xem dưới)
pnpm build        # build production (Nitro)
pnpm typecheck    # nuxi prepare + vue-tsc
pnpm lint         # eslint (flat config @antadmin)
```

Dev không có IAM thật: đặt `NUXT_AUTH_MOCK=true` trong `.env` để bỏ qua đăng nhập.

## Quy ước bắt buộc (ESLint chặn / core team reject)

- **Không import `ant-design-vue` trực tiếp** — chỉ dùng component `C*` từ `@antadmin/ui`
  (CButton, CTable, CForm, CPageHeader, CStatus…). Thiếu component thì đề xuất lên core, không tự bọc antdv.
- Composable auto-import từ layer: `useApi`, `useAuth`, `usePermission`, `useTable` — không tự viết
  fetch/auth logic trùng chức năng.
- Route công khai: `definePageMeta({ auth: false })`. Route cần quyền:
  `definePageMeta({ permissions: ['order.read'] })` — middleware `auth.global`/`permission.global` của layer tự xử lý.
- Gọi API qua BFF: `const api = useApi(); await api('/endpoint')` — KHÔNG gọi thẳng backend từ client
  (mọi request đi qua `/api/**` proxy của Nitro).
- Không nâng version `nuxt` / `ant-design-vue` khác với layer — version do core khoá.

## Gotchas kế thừa từ framework

- **Page mặc định CSR** (antdv SSR kém): layer đặt `routeRules` `ssr: false`. Đừng bật SSR lại
  cho page dùng antdv nếu chưa test kỹ.
- **Style component antdv**: `theme.components` trong ConfigProvider bị antd-vue bỏ qua —
  cần override style thì dùng global CSS, và ưu tiên đề xuất vào `@antadmin/theme` thay vì CSS cục bộ.
- **Cookie session chỉ giữ token** (giới hạn 4KB) — không nhét thêm profile/permissions vào cookie;
  lấy user info qua `useAuth()`.
- **Package framework**: các package `@antadmin/*` public được cài từ npmjs mặc định, không cần
  thêm registry override hoặc token npm.
- **pnpm chặn build script của dependency**: thêm dependency có build script mà chưa quyết định `true`/`false` trong
  `allowBuilds` của `pnpm-workspace.yaml` thì `pnpm install` fail `ERR_PNPM_IGNORED_BUILDS` (Docker/CI fail theo).
  Chỉ cho chạy với package tin cậy. Dùng đúng bản pnpm pin ở `packageManager`.

## Tính năng AI (opt-in)

Cần chat/AI trong app: cài `@antadmin/ai`, mount proxy `server/api/ai/chat.post.ts` bằng
`createAiChatProxy` (env `AI_GATEWAY_URL` + `AI_GATEWAY_KEY` — key KHÔNG bao giờ xuống client),
UI dùng `CChat` + `useAiChat`, system prompt lấy từ `@antadmin/ai/prompts` (renderPrompt).
Nhớ thêm `build.transpile: ['@antadmin/ai']`. Docs: https://daothanh.github.io/antadmin/guide/ai

## CI/CD & Deploy

`.gitlab-ci.yml` build image Docker (đa stage: `check` → `builder` → `runner` trong
`Dockerfile`) trên 1 runner shell tag `dev`, push lên registry, rồi tự deploy nhánh
`dev` lên máy dev bằng `docker-compose.dev.yml`. Nhánh `main`/tag chỉ build+push —
prod deploy thủ công bằng `scripts/deploy-prod.sh <tag>` (dùng `docker-compose.prod.yml`).
**Trước khi dùng**: đổi `REGISTRY_HOST`/`IMAGE` trong `.gitlab-ci.yml` và trong
`scripts/deploy-prod.sh` cho khớp registry/namespace thật, đổi `tags: [dev]` nếu
team dùng runner khác. Biến CI/CD cần khai (Settings → CI/CD → Variables, masked):
`REGISTRY_USER`, `REGISTRY_PASSWORD`, `NUXT_SESSION_SECRET`, `NUXT_AUTH_BASE_URL`.

## Cấu trúc & trang mẫu

- `app/pages/index.vue` — trang chủ công khai + đăng nhập/đăng xuất.
- `app/pages/orders/index.vue` — mẫu chuẩn cho trang danh sách: `CPageHeader` + `useTable` +
  `CTable` + `CStatus`/`CTag` + gating nút bằng `usePermission`. **Trang mới nên theo pattern này.**
- `app/app.config.ts` — cấu hình app-level (menu, branding).
- `.env` từ `.env.example` — auth IAM, proxy target; secrets không commit.

## Trước khi mở MR

```bash
pnpm lint && pnpm typecheck && pnpm build
```
