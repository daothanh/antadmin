---
'@antadmin/ui': minor
'@antadmin/nuxt-layer-base': minor
'@antadmin/theme': patch
---

CTable thành khung trang danh sách chuẩn; bật locale vi_VN của antdv cho toàn app

- **@antadmin/ui — `CTable`**: bọc bảng trong khung card (dựa trên `CCard`) có tiêu đề (`title` / slot `#title`) và toolbar
  tuỳ chọn: `show-create` (`@create`), `show-search` + `v-model:searchValue` (`@search` khi Enter hoặc bấm xoá),
  `show-filter` + `filter-count` (chấm đỏ, `@filter`), `show-export` (`@export`), `show-reload` (`@reload`, icon xoay khi
  loading), `show-column-setting` (nút Thiết lập — xem changeset drawer thiết lập), slot `#toolbar`; thêm `striped`,
  `collapsible`, `defaultOpen`, `borderless`, `type`. Phân trang mặc định "Tổng số dòng N" + chọn số dòng/trang + cỡ
  `default` (ghi đè từng key qua `pagination`, `false` để tắt). Cột vẫn do trang định nghĩa; props/slot/sự kiện `a-table`
  forward nguyên vẹn.
  - Thay đổi hành vi: `class`/`style` gắn vào khung ngoài (trước đây ở `a-table`); slot `#title` là tiêu đề khung (không
    còn forward làm title của `a-table`); bảng không có tiêu đề/toolbar vẫn nằm trong khung viền — dùng `borderless` khi đặt
    CTable bên trong card khác.
  - Thêm dependency `@tabler/icons-vue` cho icon toolbar.
- **@antadmin/nuxt-layer-base**: `app.vue` truyền locale `vi_VN` của antdv cho `<a-config-provider>` (phân trang "/ trang",
  Empty, Modal, Popconfirm…). Dự án tự override `app.vue` cần thêm `:locale` tương ứng.
- **@antadmin/theme** (`base.css`): sửa khoảng trống 16px ngay dưới header của bảng có `scroll`/sticky (padding ô áp nhầm vào
  hàng đo cột `ant-table-measure-row`); vạch ngăn cột ở header rõ hơn.
