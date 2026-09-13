# @antadmin/eslint-config

## 2.0.0

### Major Changes

- 1bec556: eslint: nâng lên ESLint 10 (major)
  
  - `@antadmin/eslint-config` chỉ hỗ trợ ESLint 10 — peer dependency `eslint@^10`; bộ deps nâng đồng bộ (`@eslint/js` 10, `eslint-plugin-vue` 10, `vue-eslint-parser` 10, `typescript-eslint` 8.69+). Yêu cầu Node >= 20.19.
  - Template scaffold của `@antadmin/cli` cài `eslint@^10` và `engines.node >= 20.19`.
  - Recommended configs mới có thể báo thêm lỗi (no-unassigned-vars, no-useless-assignment, preserve-caught-error, vue/block-order...); chạy lại `pnpm lint` sau khi nâng cấp.
  - Migration: xem Migration Guide `v1 → v2`.

## 1.3.1

## 1.3.0

## 1.2.1

## 1.2.0

## 1.1.0

## 1.0.3

## 1.0.2

## 1.0.1

## 1.0.0

### Major Changes

- f006fa4: Phát hành ổn định đầu tiên (1.0.0) của framework FE nội bộ AntAdmin (Nuxt 4 + Ant Design Vue).

  Bao gồm:

  - `@antadmin/nuxt-layer-base`: Nuxt layer nền — theme + UI, auth/SSO (OIDC qua BFF), middleware auth/permission, Nitro proxy `/api/**`, auto-import composables.
  - `@antadmin/ui`: wrapper Ant Design Vue chuẩn hoá (CButton/CTable/CForm) + plugin AntAdminUI.
  - `@antadmin/composables`: useApi, useAuth, usePermission, useTable.
  - `@antadmin/theme`: design token → antdv theme + CSS variables.
  - `@antadmin/utils`: AppError + helper TS thuần.
  - `@antadmin/eslint-config`, `@antadmin/tsconfig`: convention dùng chung.
  - `@antadmin/cli`: create-antadmin-app scaffold project mới.
