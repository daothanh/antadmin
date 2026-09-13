---
'@antadmin/theme': patch
---

Sửa tương phản WCAG AA cho chữ mục chưa chọn của CTopNav ở theme tối

- **@antadmin/theme — `base.css`**: mục chưa chọn của CTopNav (menu module ngang trên header `CAppLayout`) đổi màu chữ từ
  navy `#253264` tô cứng sang `--antadmin-color-text`.
  - Theme tối, trên `surface` `#162033`: 1.33 → 15.58:1. Trước đây chữ gần như chìm vào nền header.
  - Theme sáng: `#10213f` trên `#ffffff`, 12.22 → 16.01:1. Vẫn là tông navy, chỉ đậm hơn một nấc.
  - Mục đang chọn vẫn dùng `primary` + gạch chân. Màu hover không đổi, vì antdv vốn tô chữ hover bằng `colorText` (cùng
    giá trị `text`); hover vẫn được báo bằng gạch chân primary.
- Test tương phản khoá thêm cặp `text` trên `surface` (≥ 4.5:1 ở cả hai theme). Không đổi API và giá trị token.
