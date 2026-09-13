---
'@antadmin/ui': minor
'@antadmin/composables': minor
'@antadmin/utils': minor
---

CTable có drawer Thiết lập: đổi thứ tự/ẩn cột, sắp xếp mặc định, lưu localStorage theo từng bảng

- **@antadmin/ui — `CTable`**: nút ⚙ (`show-column-setting`) mở drawer **Thiết lập** thay cho popover ẩn/hiện cột.
  Tab *Hiển thị cột*: kéo thả hoặc nút ↑↓ (bàn phím/cảm ứng), công tắc Hiện/Ẩn; cột `fixed` chỉ đổi thứ tự trong nhóm,
  cột `title: ''` giữ nguyên vị trí. Tab *Khác*: sắp xếp mặc định (cột có `sorter` + chiều). Làm việc trên bản nháp
  (Lưu lại / Đặt lại, đóng là bỏ nháp), focus trả về nút Thiết lập khi đóng.
  - Prop `settingsKey`: lưu `localStorage['antadmin:table:<settingsKey>']` — mỗi bảng một khoá nên nhiều CTable trên một
    trang không ghi đè nhau; thiết lập cũ tự hợp nhất khi `columns` đổi; dữ liệu hỏng/khác version bị bỏ qua.
  - `v-model:settings` (`TableSettings`) thay cho `v-model:hiddenColumns` (chưa phát hành).
  - Lưu sắp xếp mặc định mới → CTable phát `@change` (action `sort`, về trang 1) như khi bấm tiêu đề cột. `change` nay là
    emit khai báo của CTable (có type) nên lỗi từ handler async (vd `useTable.onChange`) đi qua error handler của Vue.
  - Khi dùng thiết lập, CTable điều khiển `sortOrder` của cột `sorter` để chỉ báo khớp sắp xếp đang áp dụng (trừ khi
    trang tự khai báo `sortOrder`, dùng `sorter.multiple` hoặc có cột nhóm).
  - Có `settingsKey`/`settings` mà cột cấu hình được thiếu `key` lẫn `dataIndex` → ném lỗi `[@antadmin/ui]`.
  - Export type `TableSettings`, `TableSort`, `TableSortOrder`. Footer drawer Lọc đổi thành hai nút chia đôi cho đồng bộ.
- **@antadmin/composables — `useTable`**: `options.settingsKey` (cùng khoá với CTable) — lần load đầu theo sắp xếp mặc
  định đã lưu. `onChange` nhận đúng dạng sorter của a-table: mảng (nhiều cột) lấy cột đầu, `dataIndex` lồng nối `.`, bỏ
  sắp xếp (không có `order`) thì xoá `sortField`/`sortOrder` — trước đây vẫn gửi `sortField`.
- **@antadmin/utils**: `getTableSettings` / `setTableSettings` / `clearTableSettings` (storage truyền vào được; storage bị
  chặn thì không ném lỗi), `parseTableSettings` (kiểm tra dữ liệu không tin cậy), `tableSettingsKeyOf`, `isTableSortOrder`;
  type `TableSettings`, `TableSort`, `TableSortOrder`, `TableSettingsStorage`.
