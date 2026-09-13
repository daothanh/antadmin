---
'@antadmin/theme': patch
---

Bật ESLint cho `@antadmin/theme` — `pnpm lint` và CI giờ lint cả `src/*.ts` lẫn test Vitest `src/*.test.ts` của theme

Không đổi API, giá trị token và file publish.

- Trước đây package không có script `lint` nên Turbo bỏ qua theme khi chạy `pnpm lint`. Giờ đã thêm `eslint.config.mjs`
  theo mẫu `@antadmin/utils` (`base` + `noDirectAntdv`) và script `"lint": "eslint ."`.
- `noDirectAntdv` khoá nguyên tắc theme không import `ant-design-vue` (giữ zero runtime dep).
- Thêm devDependencies `@antadmin/eslint-config` (`workspace:*`) và `eslint` (`^10.10.0`), cùng version với các package
  khác. Code hiện có đã đạt lint, không phải sửa.
