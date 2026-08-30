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
| `CTable` | Bảng (header nền primary, ô gọn) | forward toàn bộ props `a-table` |
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
    footerText: '© Tập đoàn AntAdmin',
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

## Storybook

```bash
pnpm --filter @antadmin/ui storybook        # dev
pnpm --filter @antadmin/ui build-storybook  # build tĩnh
```
