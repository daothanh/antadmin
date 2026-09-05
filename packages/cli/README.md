# @antadmin/cli

`create-antadmin-app` — scaffold project Nuxt mới đúng chuẩn framework AntAdmin.

## Dùng
```bash
# qua npm init / pnpm create (sau khi publish):
pnpm create @antadmin/app antadmin-orders
# hoặc trực tiếp:
npx @antadmin/cli antadmin-orders
```

Tuỳ chọn:
- `--pm <pnpm|npm|yarn>` — package manager hiển thị ở hướng dẫn (mặc định pnpm).

## Project sinh ra gồm
- `nuxt.config.ts` đã `extends ['@antadmin/nuxt-layer-base']`
- `.npmrc` với cấu hình pnpm, `tsconfig` + `eslint.config` chuẩn
- `.gitlab-ci.yml` (lint → typecheck → build)
- `.env.example`, `.gitignore`, `app/pages/index.vue` mẫu

Placeholder `__APP_NAME__` và `__ANTADMIN_VERSION__` được thay khi scaffold.
