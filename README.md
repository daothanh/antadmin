# AntAdmin Framework Core

Framework FE nội bộ (Nuxt 4 + Ant Design Vue) cho mô hình tập đoàn: 1 team core, nhiều team sản phẩm.
Core team sở hữu monorepo này và publish các package `@antadmin/*` lên private registry; team sản phẩm
consume qua semver và `extends` Nuxt layer.

## Yêu cầu
- Node >= 20 (đang dùng 24)
- pnpm >= 11
- Turborepo

## Cấu trúc
```
packages/
  tsconfig/        # @antadmin/tsconfig      — cấu hình TS dùng chung
  eslint-config/   # @antadmin/eslint-config — flat config ESLint 9
  theme/           # @antadmin/theme         — design token + antd theme + CSS vars, dark mode runtime
  ui/              # @antadmin/ui            — wrapper antdv (C*), Storybook
  composables/     # @antadmin/composables   — useApi/useAuth/usePermission/useTable/useThemeMode
  utils/           # @antadmin/utils         — helper TS thuần (AppError, phân trang…)
  nuxt-layer-base/ # @antadmin/nuxt-layer-base — Nuxt layer + Nitro BFF/IAM; entry point cho team sản phẩm
  cli/             # @antadmin/cli           — create-antadmin-app (scaffold)
  ai/              # @antadmin/ai            — chat streaming qua BFF + proxy AI gateway + prompts/eval
  mcp/             # @antadmin/mcp           — MCP server tri thức framework cho AI tooling
playground/        # app test layer (dev nội bộ core)
docs/              # VitePress → https://web.docs.vtii.vn  (Storybook: /storybook)
```

> Tất cả package `@antadmin/*` đã publish ở dòng `1.2.x`. Team sản phẩm chỉ cần
> `extends @antadmin/nuxt-layer-base` là có sẵn theme, UI, auth/BFF và composables.

## Cài đặt cho team sản phẩm

Package `@antadmin/*` nằm trong GitLab Package Registry ở **cấp group `antadmin`**. Để `pnpm install`
được, project consumer cần:

1. `.npmrc` (commit vào repo consumer) trỏ scope về group endpoint:
   ```
   @antadmin:registry=https://github.com/api/v4/groups/antadmin/-/packages/npm/
   //github.com/api/v4/groups/antadmin/-/packages/npm/:_authToken=${NPM_TOKEN}
   ```
2. Biến môi trường `NPM_TOKEN` (KHÔNG commit) = **Group Deploy Token** hoặc **Group Access Token**
   của group `antadmin`, scope tối thiểu `read_package_registry`. Đặt trong CI/CD variables, hoặc trong
   `~/.npmrc` cá nhân trên máy dev.

> **Lưu ý quyền:** đây là read-only token dùng chung ở cấp group, nên **không cần** add từng dev làm
> member của project core. Nếu vẫn dùng Personal Access Token (`glpa…`) cá nhân thì user phải là member
> của group/project `antadmin` (role ≥ Reporter), nếu không GitLab trả **404** (ẩn package vì thiếu quyền đọc).

## Scripts
- `pnpm build` / `pnpm lint` / `pnpm typecheck` / `pnpm test` — chạy qua Turborepo
- `pnpm test` — Vitest; các package `composables` / `ui` / `utils` bật **coverage gate** (`--coverage` + ngưỡng)
- `pnpm --filter docs dev` — xem docs VitePress; `pnpm --filter @antadmin/ui storybook` — Storybook
- `pnpm changeset` — tạo changeset cho release
- `pnpm release` — build + publish (CI)

## Trạng thái
Nền monorepo + toàn bộ package cốt lõi đã hoàn thiện và publish (`1.3.x`): theme, ui, composables,
utils, nuxt-layer-base (BFF/IAM form login + phân quyền theo URI), cli, docs + Storybook (Cloudflare Pages).
Nền tảng AI (Giai đoạn 2) đã xong phần code: `@antadmin/ai` (chat streaming + proxy gateway +
prompts/eval), `@antadmin/mcp`, chat UI `CChat`, AI review + eval trên CI — xem
[docs AI](https://web.docs.vtii.vn/guide/ai). Việc tiếp theo: deploy AI gateway (hạ tầng),
onboarding team sản phẩm (Giai đoạn 3).
