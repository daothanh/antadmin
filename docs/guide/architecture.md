# Kiến trúc

## Mô hình phân phối

Core team sở hữu monorepo (pnpm + Turborepo), publish 9 package framework public lên npmjs.com. Team
sản phẩm **không** clone monorepo core — chỉ consume qua semver và `extends` Nuxt layer. MCP là công cụ
core-only, không nằm trong API phân phối cho sản phẩm.

```
framework-core/ (core team)
└── packages/
    ├── nuxt-layer-base/   # entry point duy nhất team sản phẩm cần
    ├── ui/                # wrapper antdv
    ├── composables/       # useApi/useAuth/usePermission/useTable
    ├── theme/             # design token + ConfigProvider
    ├── utils/             # helper TS thuần
    ├── eslint-config/ tsconfig/   # convention
    └── cli/               # create-antadmin-app
```

## Nuxt Layers

Framework đóng gói thành **Nuxt Layer**, không phải plugin rời. Team sản phẩm:

```ts
export default defineNuxtConfig({ extends: ['@antadmin/nuxt-layer-base'] })
```

Layer share: `app.config`, components/composables auto-import, middleware, plugins,
runtimeConfig defaults, Nitro server routes. Team override bằng cách định nghĩa lại file
cùng đường dẫn (Nuxt ưu tiên layer gần nhất). **Giữ tối đa 2 tầng layer** (base → app).

## Quy tắc phụ thuộc

- `nuxt-layer-base` → `ui`, `composables`, `theme`, `utils`
- `ui` → `theme` + `ant-design-vue`
- `composables` → `utils` (**không** phụ thuộc `ui`)
- `theme`, `utils`: TS thuần, zero runtime dep

## Luồng SSR + BFF

```
Browser ──/api/**──▶ Nitro (layer) ──proxy + Bearer──▶ Backend gateway
   ▲                    │
   └── httpOnly cookie ◀┘  (token KHÔNG lộ ra client)

Login: /auth/login (form) → POST BFF → IAM login + userInfo → seal session cookie → app
```

`useApi` dùng `useRequestFetch` để forward cookie khi SSR; lỗi chuẩn hoá về `AppError`.

## Chế độ render — Hybrid (mặc định CSR)

**SSR ≠ BFF.** Cờ `ssr: true` vẫn bật để Nitro/BFF (`/api`, `/auth`, cookie httpOnly)
chạy; nhưng phần **render component mặc định là client-side** vì Ant Design Vue
(cssinjs) hỗ trợ SSR chưa tốt — FOUC, hydration mismatch (Teleport/responsive),
message/notification mất theme. App nội bộ sau đăng nhập không cần SEO nên CSR an toàn nhất.

Layer cấu hình:
```ts
ssr: true,
routeRules: { '/**': { ssr: false } },  // app area CSR; BFF không đổi
```

Trang công khai cần SEO/first-paint → dự án **opt-in SSR** từng route:
```ts
// nuxt.config.ts của dự án
routeRules: { '/landing': { ssr: true } }
```
Lưu ý: route bật SSR phải tự xử lý các điểm đau antd (bọc `<client-only>` cho phần
Teleport/responsive, dùng `App.useApp()` cho message/notification).

## Quyết định cốt lõi

- **antdv**: cấm import trực tiếp (ESLint), bọc qua `@antadmin/ui`; token qua `ConfigProvider`.
- **Auth**: abstract `AuthProvider` (mặc định form login qua IAM/BFF), inject qua layer; team chỉ khai báo permission.
- **Versioning**: Changesets + lockstep; breaking → major + migration guide.
