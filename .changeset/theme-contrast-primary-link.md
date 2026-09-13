---
'@antadmin/theme': patch
'@antadmin/ui': patch
---

Sửa tương phản WCAG AA (≥ 4.5:1) cho token `primary` (theme tối) và `link` (theme sáng)

- **@antadmin/theme — token**
  - Theme tối: `primary` `#4f76d1` → `#7090dc`, `primaryHover` `#7b98df` → `#94ade6`.
    - Chữ primary trên `primary-soft` (vd `CTag color="primary"`) 3.44 → 4.77:1; trên `surface` 3.76 → 5.21:1; trên
      `surface-elevated` (modal/popover) 3.44 → 4.77:1.
    - `gradientPrimary` đổi thành `#35549e → #4466b8`, để chữ trắng của CButton primary ≥ 4.5:1 dọc cả dải, kể cả khi hover.
  - Theme sáng: `link` `#1576f4` → `#1068d6`. Nút "Đặt lại" / "Xoá tất cả" của CTable trên `surface` từ 4.26 → 5.29:1;
    đạt ≥ 4.5:1 cả trên `surface-muted`, `page` và `link-soft`.
- **@antadmin/theme — `base.css` (chỉ theme tối)**
  - Ở theme tối, primary là màu chữ sáng nên không làm nền cho chữ trắng được nữa (chỉ ~3:1). Các nền primary có chữ trắng
    chuyển sang `--antadmin-color-primary-active` (≥ 7:1):
    - header bảng; cột đang sort/hover phủ thêm lớp tối;
    - header `CCard type="primary"`;
    - nút primary thuần antdv (Modal.confirm của `useConfirm`, nút Gửi của `CChat`; không áp cho CButton);
    - ô ngày đang chọn của DatePicker / RangePicker.
  - Vì sao phải override: antdv suy màu nền từ seed `colorPrimary` (trộn 85% với `#141414`), và không có seed nào đạt ≥ 4.5:1
    cho cả chữ primary lẫn chữ trắng trên nền primary. Các chỗ antdv khác còn nền `colorPrimary` + chữ trắng mà core chưa
    dùng (vd Steps, Radio solid, Tag checkable, Menu theme dark, Badge.Ribbon) chưa được override, tương phản khoảng 4:1.
  - `::selection` theme tối: chữ `primary-active` → `primary-hover` (2.07 → 6.66:1 trên `primary-soft`).
- **@antadmin/ui — `CChatMessage`**: bubble của người dùng dùng nền `--antadmin-color-primary-active` thay cho `primary`.
  Theme sáng hơi đậm hơn (`#182544`, chữ trắng 15:1); theme tối `#35549e` (7.21:1).
- Dự án nào đặt chữ trắng lên `var(--antadmin-color-primary)` trong CSS riêng cần đổi sang `--antadmin-color-primary-active`,
  nếu không theme tối chỉ còn ~3:1.
