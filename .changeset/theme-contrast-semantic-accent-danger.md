---
'@antadmin/theme': minor
'@antadmin/ui': patch
---

Sửa tương phản WCAG AA (≥ 4.5:1) cho màu semantic, accent, nút danger và chữ màu antdv tự vẽ ở theme tối; thêm token màu chữ `accentText`, `successText`, `warningText`

- **@antadmin/theme — token mới**: `accentText`, `successText`, `warningText`
  (`--antadmin-color-{accent,success,warning}-text`), là màu chữ/icon trên nền sáng.
  - Theme sáng: `accentText` `#9e5d02`, `successText` `#087e02`, `warningText` `#a55904`. Đạt ≥ 4.5:1 trên nền `*-soft`,
    `surface`, `page` và `info-soft` (hàng đang chọn của bảng). Ở theme tối, ba token này trùng màu gốc.
  - Vì sao phải tách:
    - `accent` `#ff9800` là màu nền thương hiệu; dùng làm chữ chỉ đạt 1.93:1 trên `accent-soft`.
    - `success` và `warning` còn là seed antdv. Seed tối làm tint nền antdv sinh ra bị xỉn (vd `colorWarningBg` `#fff7e6` → `#e6dfcf`,
      ảnh hưởng Alert, Tag), nên giữ nguyên giá trị seed.
- **@antadmin/theme — token đổi giá trị**
  - Theme sáng: `error` `#ee0033` → `#d71431`.
    - Chữ trên `error-soft` 4.08 → 4.73:1, trên `surface` 4.48 → 5.21:1.
    - Chữ trắng trên nền `colorError` của antdv (Badge, hover item danger của Dropdown) 4.48 → 5.21:1.
    - Tint nền antdv giữ gần như cũ (`colorErrorBg` `#ffe6e7` → `#ffe6e6`).
  - `gradientDanger` (cả hai theme) → `linear-gradient(135deg, #cf1444, #d71431)`. Chữ trắng của CButton danger ≥ 5.21:1 dọc cả
    dải, ≥ 4.56:1 khi hover (`brightness(1.08)`). Trước đây theme sáng 3.67 → 4.48:1, theme tối 2.77 → 3.67:1.
- **@antadmin/theme — `base.css`**
  - CSideNav, item hover/đang chọn (kể cả submenu cha lúc thu gọn): giữ nền cam `accent`, chữ và icon đổi từ trắng sang navy
    `--antadmin-color-sidebar-bottom`. Theme sáng 2.16 → 7.03:1, theme tối 1.94 → 8.90:1.
  - Nút primary danger thuần antdv, cả hai theme (vd `okButtonProps: { danger: true }`): nền `--antadmin-gradient-danger`,
    hover `brightness(1.08)` như CButton danger. Theme tối 3.61 → 5.21:1; hover theme sáng 3.83 → 4.56:1.
  - Theme tối, chữ màu antdv tự trộn từ seed:
    - Trang đang chọn của Pagination (CTable) và tab đang chọn dùng `primary` (4.03 → 5.21:1 trên `surface`); hover dùng
      `primary-hover`.
    - Item danger của Dropdown (menu thao tác dòng): chữ dùng `error` (4.14 → 5.39:1), hover nền `gradient-danger`
      (3.61 → 5.21:1).
  - Chưa phủ (core chưa dùng hoặc không nằm trong đợt này):
    - Theme tối: chữ lỗi Form trong Modal/Drawer (4.14:1); số của Badge (3.61:1); nền `colorPrimary` chữ trắng của Steps,
      Radio solid, Tag checkable (4.04:1); chữ của Radio.Button và item Dropdown đang chọn.
    - Theme sáng: chữ `colorWarning`/`colorSuccess` do antdv vẽ (Form warning/success: 3.19 và 3.68:1); chữ hover của nút
      danger viền (4.24:1).
- **@antadmin/ui**: CTag `accent`/`success`/`warning`, icon `accent`/`success`/`warning` của CStatistic, trend tăng của
  CStatistic và chữ trạng thái hoạt động của CStatus chuyển sang biến `*-text`. Chấm của CStatus vẫn giữ màu gốc, vì chấm là
  đồ hoạ, chỉ cần ≥ 3:1.
- **Dự án cần làm gì**:
  - CSS riêng đang đặt chữ `var(--antadmin-color-{accent,success,warning})` trên nền sáng → đổi sang biến `*-text`.
  - Chữ trắng trên `var(--antadmin-color-accent)` → đổi sang `var(--antadmin-color-sidebar-bottom)`.
  - Bảng cặp màu an toàn nằm ở `docs/guide/theming.md`.
