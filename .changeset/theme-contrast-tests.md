---
'@antadmin/theme': patch
---

Thêm Vitest cho `@antadmin/theme`; test khoá tương phản WCAG AA của các cặp token mà component đang dùng

Không đổi API và giá trị token.

- `pnpm --filter @antadmin/theme test` giờ chạy thật (`vitest run --coverage`).
- Hàm thuần `luminanceOf` / `contrastRatioOf` tính tương phản theo WCAG 2.x (`src/contrast.ts`). Hiện chỉ test dùng nên
  chưa export ra package.
- `css-vars.test.ts` đo trên `cssVars('light')` và `cssVars('dark')`, yêu cầu ≥ 4.5:1 cho:
  - primary, primary-hover, link, text-muted trên các nền component đang dùng (primary-soft, surface, surface-elevated,
    surface-muted, page);
  - chữ trắng trên primary-active, gradient-primary, gradient-danger (theme sáng thêm primary và error); chữ
    sidebar-bottom trên accent (CSideNav);
  - toàn bộ bảng cặp AA trong `docs/guide/theming.md`: `*-text` của accent/success/warning và primary/error/info, trên nền
    soft và surface;
  - error trên surface-elevated (item danger của Dropdown); success-text và error trên info-soft (CStatus trong hàng đang
    chọn của bảng).
- Cặp đang biết là chưa đạt được ghi thành ngoại lệ kèm lý do. Test khẳng định cặp đó vẫn dưới ngưỡng; khi sửa đạt, test
  sẽ đỏ để nhắc gỡ ngoại lệ và khoá cặp lại. Hiện còn một cặp: text-subtle trên surface (mô tả CEmpty), 2.54:1 ở theme sáng,
  3.55:1 ở theme tối.
