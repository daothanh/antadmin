## Loại đóng góp

- [ ] **T1 — Fix nhỏ / nội bộ** (không đổi public API, không ảnh hưởng team khác) → không cần RFC.
- [ ] **T2 — Feature mới, không breaking** (thêm API/component/composable) → khuyến nghị RFC nếu
      ảnh hưởng ≥2 team sản phẩm hoặc thêm public API. RFC: `_______` (link, nếu có).
- [ ] **T3 — Breaking / đổi API công khai** → **bắt buộc** RFC đã `Accepted`. RFC: `_______` (link).

## Mô tả

<!-- Làm gì, vì sao. Nếu từ issue feature request hoặc RFC, link tại đây. -->

## Checklist bắt buộc

- [ ] `pnpm lint && pnpm typecheck && pnpm build && pnpm test` pass local.
- [ ] Có `.changeset/*.md` nếu đổi code trong `packages/*` (bỏ qua nếu chỉ đổi docs/config).
- [ ] Test mới/cập nhật cho package có coverage gate (`ui`, `composables`, `utils`, `ai`, `mcp`).
- [ ] Đã test tay trên playground (`pnpm turbo run dev --filter=playground`) — mô tả bước test ở dưới.
- [ ] Không import `ant-design-vue` ngoài `@antadmin/ui`; `composables` không phụ thuộc `ui`;
      `utils` không phụ thuộc Nuxt; tối đa 2 tầng Nuxt layer.
- [ ] Không đưa business logic đặc thù của 1 sản phẩm vào core (xem "Tiêu chí core-worthy" trong
      [RFC Process](../../docs/contributing/rfc.md)).
- [ ] Docs cập nhật nếu đổi API công khai (`docs/guide/*.md`) + sidebar
      `docs/.vitepress/config.ts` nếu thêm trang mới.
- [ ] Nếu breaking (T3): đã cập nhật [Migration Guide](../../docs/guide/migration.md).

## Ảnh hưởng

- Package thay đổi: `_______`
- Breaking: Có / Không
- Team sản phẩm bị ảnh hưởng trực tiếp (nếu biết): `_______`

## Test plan

<!-- Các bước tay đã làm trên playground/Storybook để xác nhận thay đổi hoạt động đúng. -->
