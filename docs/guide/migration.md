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
