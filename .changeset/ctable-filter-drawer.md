---
'@antadmin/ui': minor
'@antadmin/composables': minor
---

CTable có bộ lọc dựng sẵn: drawer chứa form lọc + thanh điều kiện lọc phía trên bảng; useTable giữ bộ lọc khi đổi trang

- **@antadmin/ui — `CTable`**: prop `filterFields` (trang khai báo trường lọc như `columns`: `input`, `select`
  (`options`, `multiple`), `date`, `dateRange`, `custom` qua slot `#filterField`; `format` để tuỳ chữ hiển thị) +
  `v-model:filterValues`. Bấm **Lọc** mở drawer làm việc trên bản nháp (Áp dụng / Đặt lại; đóng là bỏ nháp); điều kiện
  đang áp dụng hiện thành thẻ ngay trên bảng, bấm ✕ bỏ từng điều kiện hoặc **Xoá tất cả**. Chấm đỏ của nút Lọc tự đếm
  theo số điều kiện; focus trả về nút Lọc khi đóng drawer / bỏ thẻ cuối. Export type `TableFilterField`,
  `TableFilterOption`, `TableFilterValues`.
  - Không truyền `filterFields` → hành vi cũ giữ nguyên (`@filter`, `filterCount`).
  - Trường `type: 'custom'` thiếu slot `#filterField` → ném lỗi `[@antadmin/ui]` khi dựng bảng.
- **@antadmin/ui — `CTag`**: thêm `closable` + `closeText` (nhãn đọc màn hình), sự kiện `close`; nút ✕ là `<button>`
  thao tác được bằng bàn phím.
- **@antadmin/composables — `useTable`**: thêm `onFilter(values)` (bind `@update:filter-values`, về trang 1 rồi tải
  lại), `filterValues` (bind `:filter-values`) và `options.filters` (bộ lọc mặc định). `query.filters` = filter cột của
  `a-table` gộp với bộ lọc form (trùng key thì form thắng) — trước đây `onChange` ghi đè `query.filters` bằng filter cột
  mỗi lần đổi trang.
