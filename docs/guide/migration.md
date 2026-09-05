# Migration Guide

Mỗi **major** của `@antadmin/*` có một mục migration. Các package `@antadmin/*` đi **lockstep**
(cùng version), nên nâng cấp đồng loạt.

## Nguyên tắc nâng cấp

1. Đọc mục migration của major đích (bên dưới).
2. Bump `@antadmin/nuxt-layer-base` (kéo theo ui/theme/composables cùng version).
3. Chạy `pnpm install`, rồi `pnpm typecheck` để bắt breaking ở mức type trước.
4. Test trên channel `next`/`beta` trước khi lên `latest` (xem [Release](/contributing/releasing)).

```bash
# thử bản beta
pnpm add @antadmin/nuxt-layer-base@beta
```

## Mẫu mục migration (cho core team)

> Khi phát hành major Y, thêm một mục theo mẫu này.

### vX → vY

**Breaking changes**
- _Mô tả thay đổi phá vỡ, lý do._

**Hành động cần làm**
- _Bước cụ thể team sản phẩm phải làm (đổi API, đổi config...)._

**Codemod / tự động hoá** (nếu có)
- _Lệnh/script hỗ trợ._

---

## v1 → v2

**Breaking changes**
- `@antadmin/eslint-config` chỉ còn hỗ trợ **ESLint 10** (`eslint@^10`). Yêu cầu Node tối thiểu nâng lên **>= 20.19.0** (hoặc 22.13+ / 24).
- Bộ rule đi kèm nâng major đồng bộ: `@eslint/js` 10, `eslint-plugin-vue` 10, `vue-eslint-parser` 10, `typescript-eslint` 8.69+ — recommended configs có thể báo thêm lỗi mới.
- ESLint 10 tìm config bắt đầu từ thư mục của từng file linted (không còn chỉ theo cwd) — đảm bảo `eslint.config.mjs` của mỗi dự án/phân vùng vẫn được phát hiện đúng.

**Hành động cần làm**
```bash
# nâng dependency (template scaffold của @antadmin/cli đã dùng sẵn bản mới)
pnpm add -D eslint@^10 @antadmin/eslint-config@^2

# chạy lại lint — recommended rules thay đổi, có thể cần sửa code mới bị báo
pnpm lint
```

- Nếu đang dùng rule/plugin custom viết cho ESLint 9, kiểm tra với [migration guide ESLint 10](https://eslint.org/docs/latest/use/migrate-to-10.0.0) (bỏ `context.getSourceCode()`, `SourceCode.getTokenOrCommentBefore()`...).

---

## v0 → v1 (ví dụ)

**Breaking changes**
- `useApi` trả về instance gọi trực tiếp thay vì object `{ get, post }` (ví dụ minh hoạ).

**Hành động cần làm**
```diff
- const { get } = useApi()
- const data = await get('/orders')
+ const api = useApi()
+ const data = await api('/orders')
```
