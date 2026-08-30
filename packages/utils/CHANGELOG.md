# @antadmin/utils

## 1.4.0

### Patch Changes

- ae96b1a: Phát hành công khai toàn bộ package AntAdmin lên npmjs.com bằng trusted publishing của GitHub Actions.

## 1.3.0

### Minor Changes

- 5c1d097: feat: error handler toàn cục (3 tầng)

  - **@antadmin/utils**: helper phân loại lỗi — `isAuthError`/`isForbidden`/`isValidation`/`isServerError`/`isNetworkError`, `errorSeverity`, `getFieldErrors`.
  - **@antadmin/ui**: `useErrorHandler()` — hiển thị lỗi nhất quán (message cho lỗi thường, notification cho 5xx/network), gọi hook 401/403, dedupe toast, bỏ qua 422 để form tự xử lý. Router-agnostic.
  - **@antadmin/nuxt-layer-base**: plugin `04.error` (bắt lỗi Vue chưa xử lý + `$antadminError` để opt-in; 401 → redirect `/auth/login`) và trang `error.vue` fatal.

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
