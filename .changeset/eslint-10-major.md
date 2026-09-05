---
'@antadmin/eslint-config': major
'@antadmin/cli': major
---

eslint: nâng lên ESLint 10 (major)

- `@antadmin/eslint-config` chỉ hỗ trợ ESLint 10 — peer dependency `eslint@^10`; bộ deps nâng đồng bộ (`@eslint/js` 10, `eslint-plugin-vue` 10, `vue-eslint-parser` 10, `typescript-eslint` 8.69+). Yêu cầu Node >= 20.19.
- Template scaffold của `@antadmin/cli` cài `eslint@^10` và `engines.node >= 20.19`.
- Recommended configs mới có thể báo thêm lỗi (no-unassigned-vars, no-useless-assignment, preserve-caught-error, vue/block-order...); chạy lại `pnpm lint` sau khi nâng cấp.
- Migration: xem Migration Guide `v1 → v2`.