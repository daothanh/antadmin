# UI — @antadmin/ui

Bộ component design system của AntAdmin, xây trên Ant Design Vue và bám design token
(`@antadmin/theme`). **Không** import trực tiếp `ant-design-vue` — ESLint sẽ chặn; dùng
qua `@antadmin/ui` (hoặc các component `C*` đã đăng ký global).

Tham khảo trực quan: chạy playground (`pnpm turbo run dev --filter=playground`) → trang **/ui-kit**,
hoặc Storybook (`pnpm --filter @antadmin/ui storybook`).

## Component thương hiệu (có style riêng)

Đăng ký global qua `app.use(AntAdminUI)` (layer đã làm) → dùng thẳng trong template,
không cần import.

| Component | Mô tả | Props chính |
|---|---|---|
| `CButton` | Nút đa biến thể, gradient thương hiệu | `variant` (`primary`/`secondary`/`outline`/`ghost`/`danger`/`link`/`text`), `size` (`sm`/`md`/`lg`), `block` |
| `CCard` | Thẻ nội dung, có chế độ thu gọn | `title`, `collapsible`, `defaultOpen`, `borderless`; slot `#title`, `#actions` |
| `CTable` | Bảng trang danh sách: khung + toolbar + bộ lọc drawer + thiết lập cột/sắp xếp mặc định + phân trang chuẩn (xem mục CTable bên dưới) | `title`, `show-create`/`show-search`/`show-filter`/`show-export`/`show-reload`/`show-column-setting`, `filterFields`, `v-model:filterValues`, `filterCount`, `v-model:searchValue`, `settingsKey`, `v-model:settings`, `striped`, `collapsible`; slot `#title`, `#toolbar`, `#filterField`; forward toàn bộ props/slot/sự kiện `a-table` |
| `CForm` | Form (mặc định `layout="vertical"`) | forward props `a-form` |
| `CPageHeader` | Tiêu đề trang + breadcrumb | `title`, `subTitle`, `breadcrumb[]`; event `@navigate`; slot `#extra` |
| `CStatistic` | Thẻ chỉ số KPI | `label`, `value`, `trend`, `accent`; slot `#icon`, `#suffix` |
| `CTag` | Nhãn pill semantic | `color` (`default`/`primary`/`accent`/`success`/`warning`/`error`/`info`), `dot`, `closable` + `closeText` (nhãn đọc màn hình của nút ✕); event `@close` |
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
import type { TableFilterField } from '@antadmin/ui'

const api = useApi()
const { can } = usePermission()
const keyword = ref('')
// Khoá thiết lập của bảng — CTable và useTable dùng chung (xem mục "Thiết lập bảng").
const TABLE_KEY = 'vehicles'
// openCreate, exportExcel, onAction… là hàm của trang.
const { dataSource, loading, pagination, query, filterValues, onChange, onFilter, reload } = useTable<Vehicle>(
  (q) => api('/vehicles', { query: { ...q, keyword: keyword.value } }),
  { pageSize: 25, filters: { status: 1 }, settingsKey: TABLE_KEY }, // bộ lọc mặc định (tuỳ chọn)
)

// Trường lọc cũng do trang khai báo (như columns) — xem mục "Bộ lọc dựng sẵn" bên dưới.
const filterFields: TableFilterField[] = [
  { key: 'code', label: 'Mã xe', type: 'input' },
  { key: 'brand', label: 'Hãng xe', type: 'select', options: BRAND_OPTIONS, multiple: true },
  { key: 'status', label: 'Trạng thái', type: 'select', options: STATUS_OPTIONS },
  { key: 'updatedAt', label: 'Ngày cập nhật', type: 'dateRange' },
]

const columns = [
  // STT/cột thao tác là cột của trang — tự dựng.
  { title: 'STT', key: 'index', width: 64, align: 'center',
    customRender: ({ index }: { index: number }) => (query.page - 1) * query.pageSize + index + 1 },
  { title: 'Mã xe', dataIndex: 'code', key: 'code', sorter: true }, // sorter → chọn được làm sắp xếp mặc định
  { title: 'Tên xe', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '', key: 'actions', width: 56, align: 'center' }, // title rỗng → không có trong thiết lập, giữ chỗ
]
</script>

<template>
  <CTable
    v-model:search-value="keyword"
    title="Danh sách phiên bản xe"
    :settings-key="TABLE_KEY"
    row-key="id"
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    :filter-fields="filterFields"
    :filter-values="filterValues"
    :show-create="can('/vehicles/create')"
    show-search show-filter show-export show-reload show-column-setting
    @change="onChange"
    @update:filter-values="onFilter"
    @search="reload"
    @reload="reload"
    @create="openCreate"
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
| `show-filter`, `filter-text` | `false`, `Lọc` | Nút Lọc → `@filter`; có `filter-fields` thì mở drawer lọc dựng sẵn |
| `filter-fields`, `v-model:filter-values` | —, — | Bộ lọc dựng sẵn: drawer + thanh điều kiện lọc (xem bên dưới); không bind `filter-values` thì CTable tự giữ state |
| slot `#filterField="{ field, values }"` | — | Control cho trường `type: 'custom'` — `v-model:value="values[field.key]"` |
| `filter-count` | `0` | Chấm đỏ trên nút Lọc khi trang tự làm drawer/panel lọc; có `filter-fields` thì tự đếm, bỏ qua prop này |
| `show-export`, `show-reload` | `false` | Nút tròn → `@export`, `@reload`; icon tải lại xoay khi `loading` |
| `show-column-setting` | `false` | Nút tròn Thiết lập → drawer đổi thứ tự/ẩn cột + sắp xếp mặc định (xem bên dưới) |
| `settings-key` | — | Lưu thiết lập vào `localStorage` (`antadmin:table:<settings-key>`), mỗi bảng một khoá; truyền cùng khoá cho `useTable` |
| `v-model:settings` | — | Thiết lập đang áp dụng (`TableSettings`) — bind khi tự lưu nơi khác (vd server); có giá trị thì thắng `settings-key` |
| `@change` | — | Sự kiện `a-table`; CTable cũng phát (action `sort`, về trang 1) khi lưu sắp xếp mặc định mới |
| slot `#toolbar` | — | Chèn nút riêng vào đầu toolbar |
| `striped`, `collapsible`, `default-open`, `borderless`, `type` | `false`, `false`, `true`, `false`, `default` | Dòng xen kẽ; khung thu gọn/biến thể như `CCard` |

- Không bật tiêu đề/toolbar → chỉ còn bảng trong khung viền (tương thích cách dùng cũ).
- `pagination` của trang được gộp với mặc định (`showTotal` "Tổng số dòng N", `showSizeChanger`,
  cỡ `default`) — ghi đè từng key; `:pagination="false"` để tắt.
- `class`/`style` gắn vào khung ngoài; slot `#title` là tiêu đề khung (không còn forward xuống `a-table`).

### Bộ lọc dựng sẵn (drawer + thanh điều kiện lọc)

Truyền `filter-fields` (cùng `show-filter`) → bấm **Lọc** mở drawer chứa form lọc; điều kiện đang áp
dụng hiện thành thẻ ngay trên bảng, bấm ✕ để bỏ từng điều kiện hoặc **Xoá tất cả**. Không truyền
`filter-fields` → nút Lọc chỉ phát `@filter` như trước (trang tự làm drawer, tự đếm `filter-count`).

| `type` | Control | Giá trị trong `filterValues` | Hiển thị trên thẻ |
|---|---|---|---|
| `input` | Ô nhập (Enter = Áp dụng) | chuỗi (đã trim) | chuỗi |
| `select` | Select tìm theo nhãn; `options: { label, value }[]`, `multiple` | `value` hoặc mảng `value` | nhãn option, nối bằng dấu phẩy |
| `date` | DatePicker | `'YYYY-MM-DD'` | `DD/MM/YYYY` |
| `dateRange` | RangePicker | `['YYYY-MM-DD', 'YYYY-MM-DD']` | `DD/MM/YYYY – DD/MM/YYYY` |
| `custom` | Slot `#filterField` | tuỳ control | `format(value)` nếu có, không thì chuỗi của giá trị |

Mọi trường có `key`, `label`, `placeholder?` và `format?: (value) => string` (ghi đè chữ hiển thị trên
thẻ — nên khai báo khi giá trị custom là object).

- **Drawer làm việc trên bản nháp**: sửa chưa ảnh hưởng bảng; **Áp dụng** mới phát
  `update:filterValues` rồi đóng; đóng drawer (✕, click nền, Esc) là bỏ nháp; **Đặt lại** chỉ xoá nháp
  (vẫn cần Áp dụng). Đóng drawer thì focus trở về nút Lọc.
- Giá trị phát ra đã bỏ trường rỗng (`''`, `null`, `[]`, khoảng ngày trống); `0` và `false` vẫn là điều
  kiện hợp lệ. Chấm đỏ + `aria-label` của nút Lọc đếm theo số điều kiện đang áp dụng.
- Key có giá trị nhưng không khai báo trong `filter-fields` (vd đọc từ URL) vẫn có thẻ, nhãn là key —
  không có "lọc ngầm".
- Trường `custom` mà thiếu slot `#filterField` → lỗi `[@antadmin/ui]` ngay khi dựng bảng.
- Với `useTable`: bind `:filter-values="filterValues"` + `@update:filter-values="onFilter"` — bộ lọc được
  gộp với filter cột của `a-table` vào `query.filters` (xem [Composables](/guide/composables#usetable)).
  Trang tự viết `@change` (không dùng `useTable`) phải tự gộp, vì `a-table` phát lại filter cột mỗi lần
  đổi trang.
- `query.filters` là object nên `useApi` gửi dạng JSON trong query string (`filters=%7B…%7D`); backend
  cần dạng khác (vd `status=1&brand=GEELY`) thì chuyển đổi trong fetcher.
- `CFilterBar` vẫn dùng cho vài control lọc đặt ngang phía trên bảng; nhiều trường → dùng drawer.

### Thiết lập bảng

Bật `show-column-setting` → nút ⚙ mở drawer **Thiết lập** gồm 2 tab:

- **Hiển thị cột** — kéo tay nắm ⋮⋮ (chuột) hoặc nút ↑/↓ (bàn phím, cảm ứng) để đổi thứ tự; công tắc Hiện/Ẩn (luôn còn
  ít nhất một cột hiện). Cột `title: ''` (cột tiện ích như ⋮) không có trong danh sách và giữ nguyên vị trí; cột `fixed`
  chỉ đổi thứ tự trong nhóm cố định của nó.
- **Khác** (chỉ có khi bảng có cột `sorter`) — **Sắp xếp mặc định**: bật/tắt, chọn cột (cột có `sorter` + `dataIndex`
  dạng chuỗi) và chiều Tăng dần/Giảm dần.

Drawer làm việc trên bản nháp như drawer Lọc: **Lưu lại** mới áp dụng; đóng là bỏ nháp; **Đặt lại** đưa nháp về cấu hình
gốc (thứ tự theo `columns`, hiện hết, tắt sắp xếp) — bấm Lưu lại để áp dụng và xoá thiết lập đã lưu.

```vue
<script setup lang="ts">
const TABLE_KEY = 'vehicles' // mỗi bảng một khoá
const { dataSource, loading, pagination, onChange } = useTable<Vehicle>(fetcher, { settingsKey: TABLE_KEY })
const columns = [
  { title: 'Mã xe', dataIndex: 'code', key: 'code', sorter: true },
  { title: 'Ngày cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', sorter: true },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
]
</script>

<template>
  <CTable
    :settings-key="TABLE_KEY"
    show-column-setting
    :columns="columns" :data-source="dataSource" :loading="loading" :pagination="pagination"
    @change="onChange"
  />
</template>
```

**Lưu trữ và nhiều bảng trên một trang**

- Có `settings-key` → thiết lập lưu ở `localStorage['antadmin:table:<settings-key>']` dạng
  `{ version: 1, columnOrder, hiddenColumns, defaultSort }`; không truyền → chỉ giữ trong phiên.
- **Mỗi CTable một khoá**, đặt tường minh theo màn hình/bảng: `orders`, `orders:items`. CTable không tự sinh khoá theo
  route hay thứ tự bảng (route động và bảng render có điều kiện làm khoá thay đổi) và không kiểm tra trùng khoá lúc chạy
  — hai bảng cùng khoá sẽ dùng chung thiết lập.
- Lưu đúng cấu hình gốc → xoá khoá. Dữ liệu hỏng, khác version hoặc storage bị chặn (private mode…) → dùng cấu hình
  gốc, không báo lỗi.
- `columns` đổi giữa các bản deploy: key không còn bị bỏ, cột mới chèn ngay sau cột đứng trước nó trong `columns` và mặc
  định hiện; sắp xếp mặc định trỏ tới cột không còn sắp xếp được thì coi như tắt.
- Có `settings-key`/`v-model:settings` mà cột cấu hình được thiếu cả `key` lẫn `dataIndex` → lỗi `[@antadmin/ui]` khi
  dựng bảng (key theo vị trí sẽ áp nhầm thiết lập khi thêm/bớt cột).
- Thiết lập lưu theo trình duyệt, chưa tách theo người dùng. Muốn lưu lên server: bỏ `settings-key`, bind
  `v-model:settings`, kiểm tra dữ liệu đọc về bằng `parseTableSettings` của `@antadmin/utils`.

**Sắp xếp mặc định**

- `useTable({ settingsKey })` đọc sắp xếp mặc định cùng khoá → lần tải đầu đã đúng thứ tự, không phải tải hai lần.
  Quên `settingsKey` ở `useTable` thì bảng vẫn hiện chỉ báo sắp xếp nhưng dữ liệu lần đầu chưa sắp xếp.
- Lưu sắp xếp mặc định mới (hoặc tắt) → CTable phát `@change` (action `sort`, về trang 1, sorter giống khi bấm tiêu đề
  cột; tắt → sorter `{}`) → `useTable.onChange` tải lại. Chỉ đổi thứ tự/ẩn cột thì không phát `change`.
- Khi dùng thiết lập, CTable điều khiển `sortOrder` của các cột `sorter` để chỉ báo khớp sắp xếp đang áp dụng (bấm tiêu
  đề cột vẫn đổi được, không lưu). Không can thiệp nếu trang tự khai báo `sortOrder`, dùng `sorter.multiple` hoặc có cột
  nhóm (`children`); `defaultSortOrder` của cột vẫn là sắp xếp ban đầu khi người dùng chưa đặt.
- Trang tự viết `@change` (không dùng `useTable`): lấy `getTableSettings(key)?.defaultSort` của `@antadmin/utils` cho lần
  tải đầu.

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
