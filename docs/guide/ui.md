# UI — @antadmin/ui

Bộ component design system của AntAdmin, xây trên Ant Design Vue và bám design token
(`@antadmin/theme`). **Không** import trực tiếp `ant-design-vue` — ESLint sẽ chặn; dùng
qua `@antadmin/ui` (hoặc các component `C*` đã đăng ký global).

Tham khảo trực quan: chạy playground (`pnpm --filter playground dev`) → trang **/ui-kit**,
hoặc Storybook (`pnpm --filter @antadmin/ui storybook`).

## Component thương hiệu (có style riêng)

Đăng ký global qua `app.use(AntAdminUI)` (layer đã làm) → dùng thẳng trong template,
không cần import.

| Component | Mô tả | Props chính |
|---|---|---|
| `CButton` | Nút đa biến thể, gradient thương hiệu | `variant` (`primary`/`secondary`/`outline`/`ghost`/`danger`/`link`/`text`), `size` (`sm`/`md`/`lg`), `block` |
| `CCard` | Thẻ nội dung, có chế độ thu gọn | `title`, `collapsible`, `defaultOpen`, `borderless`; slot `#title`, `#actions` |
| `CTable` | Bảng trang danh sách: khung + toolbar + phân trang chuẩn (xem mục CTable bên dưới) | `title`, `show-create`/`show-search`/`show-filter`/`show-export`/`show-reload`/`show-column-setting`, `filterCount`, `v-model:searchValue`, `v-model:hiddenColumns`, `striped`, `collapsible`; slot `#title`, `#toolbar`; forward toàn bộ props/slot/sự kiện `a-table` |
| `CForm` | Form (mặc định `layout="vertical"`) | forward props `a-form` |
| `CPageHeader` | Tiêu đề trang + breadcrumb | `title`, `subTitle`, `breadcrumb[]`; event `@navigate`; slot `#extra` |
| `CStatistic` | Thẻ chỉ số KPI | `label`, `value`, `trend`, `accent`; slot `#icon`, `#suffix` |
| `CTag` | Nhãn pill semantic | `color` (`default`/`primary`/`accent`/`success`/`warning`/`error`/`info`), `dot` |
| `CStatus` | Chỉ báo active/inactive | `status`, `activeValue`, `activeText`, `inactiveText`, `showText` |
| `CEmpty` | Trạng thái rỗng | `description`, `bordered`; slot `#image`, default (actions) |
| `CInputCurrency` | Ô nhập tiền tệ (1.234.567,89 ↔ số) | `v-model:value` (number) |
| `CInputPercent` | Ô nhập phần trăm, kẹp min/max | `v-model:value`, `min`, `max`, `precision` |
| `CChat` | Khung chat AI (nối `useAiChat` — xem [AI](/guide/ai)) | `messages`, `status`, `error`, `disabled`; event `@send`, `@stop`, `@clear` |
| `CChatMessage` | Bong bóng message theo role | `role`, `content`, `pending` (chấm gõ chờ token đầu) |

```vue
<template>
  <CPageHeader title="Đơn hàng" :breadcrumb="[{ title: 'Trang chủ', to: '/' }, { title: 'Đơn hàng' }]">
    <template #extra>
      <CButton variant="outline" size="sm">Xuất Excel</CButton>
      <CButton variant="primary" size="sm">Tạo đơn</CButton>
    </template>
  </CPageHeader>

  <CCard title="Bộ lọc" collapsible>
    <CForm>
      <a-form-item label="Số tiền"><CInputCurrency v-model:value="amount" /></a-form-item>
    </CForm>
  </CCard>

  <CTag color="success" dot>Hoàn thành</CTag>
  <CStatus :status="1" show-text />
</template>
```

## CTable — bảng trang danh sách

`CTable` là khung chuẩn cho trang danh sách: header card có tiêu đề + toolbar bên phải, header
bảng nền primary, phân trang "Tổng số dòng N". **Không định nghĩa sẵn cột nào** — cột do trang
khai báo qua `columns` (+ slot `#bodyCell`); mọi prop/slot/sự kiện khác của `a-table` được forward
nguyên vẹn nên bind thẳng với `useTable` như trước.

```vue
<script setup lang="ts">
const api = useApi()
const { can } = usePermission()
const keyword = ref('')
// activeFilters, filterOpen, openCreate, exportExcel, onAction… là state/hàm của trang.
const { dataSource, loading, pagination, query, onChange, reload } = useTable<Vehicle>(
  (q) => api('/vehicles', { query: { ...q, keyword: keyword.value } }),
  { pageSize: 25 },
)

const columns = [
  // STT/cột thao tác là cột của trang — tự dựng.
  { title: 'STT', key: 'index', width: 64, align: 'center',
    customRender: ({ index }: { index: number }) => (query.page - 1) * query.pageSize + index + 1 },
  { title: 'Mã xe', dataIndex: 'code', key: 'code' },
  { title: 'Tên xe', dataIndex: 'name', key: 'name' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '', key: 'actions', width: 56, align: 'center' }, // title rỗng → không có trong cài đặt cột
]
</script>

<template>
  <CTable
    v-model:search-value="keyword"
    title="Danh sách phiên bản xe"
    row-key="id"
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    :filter-count="activeFilters"
    :show-create="can('/vehicles/create')"
    show-search show-filter show-export show-reload show-column-setting
    @change="onChange"
    @search="reload"
    @reload="reload"
    @create="openCreate"
    @filter="filterOpen = true"
    @export="exportExcel"
  >
    <template #bodyCell="{ column, record }">
      <CStatus v-if="column.key === 'status'" :status="record.status" />
      <a-dropdown v-else-if="column.key === 'actions'" :trigger="['click']">
        <CButton variant="text" size="sm">⋮</CButton>
        <template #overlay>
          <a-menu @click="({ key }) => onAction(key, record)">
            <a-menu-item key="edit">Sửa</a-menu-item>
            <a-menu-item key="delete" danger>Xoá</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
  </CTable>
</template>
```

| Prop | Mặc định | Ghi chú |
|---|---|---|
| `title` / slot `#title` | `''` | Tiêu đề bên trái header |
| `show-create`, `create-text` | `false`, `Thêm mới` | Nút primary → `@create` |
| `show-search`, `v-model:search-value`, `search-placeholder` | `false`, `''`, `Tìm kiếm...` | `@search(value)` khi Enter hoặc bấm nút xoá (không tự debounce) |
| `show-filter`, `filter-text`, `filter-count` | `false`, `Lọc`, `0` | `@filter`; `filter-count > 0` hiện chấm đỏ — trang tự mở drawer/panel lọc |
| `show-export`, `show-reload` | `false` | Nút tròn → `@export`, `@reload`; icon tải lại xoay khi `loading` |
| `show-column-setting`, `v-model:hidden-columns` | `false`, — | Popover ẩn/hiện cột; key cột = `key` → `dataIndex`. Bind v-model nếu muốn lưu lựa chọn (localStorage…) |
| slot `#toolbar` | — | Chèn nút riêng vào đầu toolbar |
| `striped`, `collapsible`, `default-open`, `borderless`, `type` | `false`, `false`, `true`, `false`, `default` | Dòng xen kẽ; khung thu gọn/biến thể như `CCard` |

- Không bật tiêu đề/toolbar → chỉ còn bảng trong khung viền (tương thích cách dùng cũ).
- `pagination` của trang được gộp với mặc định (`showTotal` "Tổng số dòng N", `showSizeChanger`,
  cỡ `default`) — ghi đè từng key; `:pagination="false"` để tắt.
- `class`/`style` gắn vào khung ngoài; slot `#title` là tiêu đề khung (không còn forward xuống `a-table`).

## Re-export có kiểm soát (primitive antdv)

Các primitive không cần wrap được re-export (đặt bí danh `C*`) để có một điểm import
duy nhất và thoả ESLint:

```ts
// Layout
import { Row, Col, Space, Flex, Divider, Typography, Layout } from '@antadmin/ui'
// Nhập liệu
import { CInput, CTextarea, CInputNumber, CSelect, CSelectOption, CCheckbox, CSwitch, CDatePicker, CRangePicker, CFormItem, CUpload } from '@antadmin/ui'
// Hiển thị dữ liệu
import { CDescriptions, CBadge, CAvatar, CTabs, CTabPane, CCollapse, CTooltip, CPopover, CPagination, CSteps, CTree } from '@antadmin/ui'
// Phản hồi
import { CModal, CDrawer, CPopconfirm, CResult, CSpin, CSkeleton, CAlert, CProgress } from '@antadmin/ui'
// Điều hướng
import { CDropdown, CMenu, CMenuItem, CBreadcrumb, CBreadcrumbItem } from '@antadmin/ui'
// Imperative
import { message, notification } from '@antadmin/ui'
```

## Layout shell (kế thừa sẵn)

Framework cung cấp **layout mặc định** (`default.vue` trong layer): khung sider (gradient
navy + brand) + header (toggle thu gọn + account/logout) + vùng nội dung cuộn + footer.
Dự án `extends @antadmin/nuxt-layer-base` **không cần dựng lại** — chỉ khai báo trong
`app/app.config.ts`:

Bố cục giống OneAuto: dải logo navy góc trên-trái + **menu module ngang** (`topNav`)
trên header, **sidebar có icon** + item active pill cam, chuông + account bên phải.

```ts
import { h } from 'vue'
import { IconHome, IconShoppingCart } from '@tabler/icons-vue'
import type { NavItem } from '@antadmin/ui'

export default defineAppConfig({
  antadmin: {
    appTitle: 'Sản phẩm A',
    footerText: '© AntAdmin',
    // Menu module ngang trên header (bỏ trống nếu không dùng).
    topNav: [
      { label: 'Tổng quan', path: '/' },
      { label: 'Bán hàng', path: '/orders' },
    ] satisfies NavItem[],
    // Menu sidebar — icon là component (vd @tabler/icons-vue).
    nav: [
      { label: 'Trang chủ', path: '/', icon: () => h(IconHome, { size: 18 }) },
      {
        label: 'Bán hàng',
        icon: () => h(IconShoppingCart, { size: 18 }),
        children: [{ label: 'Đơn hàng', path: '/orders' }],
      },
    ] satisfies NavItem[],
  },
})
```

- `CSideNav`/`CTopNav` tự tô sáng item theo `route.path` (khớp tiền tố dài nhất); sidebar mở sẵn submenu cha.
- Điều hướng router-agnostic: click item phát `@navigate(path)` → layer gọi `navigateTo`.
- `icon` là render function của component icon (khuyến nghị `@tabler/icons-vue` như OneAuto); giúp chế độ thu gọn hiển thị đẹp.
- **Đổi khung hoàn toàn**: tạo `app/layouts/default.vue` trong dự án (Nuxt ưu tiên layer gần nhất).
- Dựng layout thủ công từ component thô: `CAppLayout` (slot `#logo`/`#nav`/`#header`/`#actions`/`#footer`) + `CSideNav` + `CTopNav`.

| Component | Mô tả | Props/Slots chính |
|---|---|---|
| `CAppLayout` | Khung shell: dải logo + header + sider + content + footer | `v-model:collapsed`, `appTitle`, `footerText`, `siderWidth`; slot `#logo`/`#nav`/`#header`/`#actions`/`#footer` |
| `CSideNav` | Menu sidebar từ config (icon + submenu, active pill cam) | `items: NavItem[]`, `activePath`, `collapsed`; event `@navigate` |
| `CTopNav` | Menu module ngang trên header | `items: NavItem[]`, `activePath`; event `@navigate` |

## Theme & style

- Màu/biến thể bám CSS variables `--antadmin-*` (sinh từ [`@antadmin/theme`](./theming.md)).
- Layer nạp sẵn `@antadmin/theme/base.css` (reset, scrollbar, header bảng navy, menu active accent)
  và `@antadmin/ui/style.css` (scoped style component). App không cần import thủ công.
- Đổi nhận diện: sửa token trong `@antadmin/theme` → lan toả toàn bộ component.
- Ngôn ngữ: layer truyền locale `vi_VN` của antdv cho `<a-config-provider>` (phân trang "/ trang",
  Empty, Modal, Popconfirm…). Tên tháng/thứ của DatePicker theo dayjs — dự án nạp `dayjs/locale/vi`
  nếu cần. Sản phẩm dùng ngôn ngữ khác: override `app.vue` và truyền locale tương ứng.

## Storybook

```bash
pnpm --filter @antadmin/ui storybook        # dev
pnpm --filter @antadmin/ui build-storybook  # build tĩnh
```
