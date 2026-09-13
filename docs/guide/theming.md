# Theme — @antadmin/theme

Design token là **single source of truth**, suy ra cả antdv theme lẫn CSS variables. Package TS
thuần, không phụ thuộc runtime antdv.

## API

```ts
import {
  lightTokens, darkTokens, tokensByMode,
  getAntdTheme, antdThemeLight, antdThemeDark,
  cssVars, cssVarsText,
  type ThemeMode, type AntAdminTokens,
} from '@antadmin/theme'
```

## Áp theme

Layer tự bọc `<a-config-provider>` với token + algorithm + locale `vi_VN` và inject CSS vars `--antadmin-*`. Đổi chế độ
mặc định qua `app.config.ts`:

```ts
export default defineAppConfig({
  antadmin: { themeMode: 'dark' },
})
```

## Dùng CSS variables

```css
.box { color: var(--antadmin-color-primary); border-radius: var(--antadmin-radius); }
```

## Font chữ (Quicksand + Montserrat)

Layer tích hợp sẵn **`@nuxt/fonts`** — tự **self-host** (tải về, phục vụ qua `/_fonts/`, không gọi
runtime tới Google):

- **Quicksand** → chữ thân (`--antadmin-font-family`), weight 300–700.
- **Montserrat** → tiêu đề (`--antadmin-font-family-heading`), weight 400–700.

Cấu hình ở `@antadmin/nuxt-layer-base/nuxt.config.ts` (`fonts.families` + `experimental.processCSSVariables`);
tên font khai báo tĩnh trong `@antadmin/theme/base.css` để module dò & tải được (font-family thực dùng
qua biến `--antadmin-*`).

Đổi font: sửa `fontStack`/`fontHeadingStack` trong `packages/theme/src/tokens.ts` **và** danh sách
`fonts.families` trong layer (dự án có thể override `fonts` trong `nuxt.config.ts` của mình).

> Lần build đầu cần mạng để tải font (sau đó cache trong `node_modules/.cache`).

## Mật độ component (padding / height / margin)

⚠️ **ant-design-vue 4.x bỏ qua `theme.components`** — không chỉnh được padding/height/margin
component theo kiểu antd v5. Framework giải quyết bằng 2 tầng, đều lấy giá trị từ **`density`
trong `tokens.ts`** (sửa một chỗ):

- **Height** (Input/Select/Button/Picker) → qua **global token** `controlHeight`/`SM`/`LG`
  (antd áp được qua thuật toán).
- **Padding/margin** (Card, Form item, Table cell, Modal/Drawer) → qua **global CSS** trong
  `@antadmin/theme/base.css`, đọc biến `--antadmin-*` (Card `--antadmin-card-padding-*`, Form
  `--antadmin-form-item-margin`, Table `--antadmin-table-cell-padding-*`, Modal `--antadmin-modal-body-padding`).

```ts
// packages/theme/src/tokens.ts — chỉnh density, lan toả mọi app
const density: DensityTokens = {
  controlHeightSM: 28, controlHeight: 36, controlHeightLG: 44,
  cardPaddingBlock: 12, cardPaddingInline: 16,
  formItemMarginBottom: 16,
  tableCellPaddingBlock: 8, tableCellPaddingInline: 8,
  modalBodyPadding: 16,
}
```

Cần chỉnh component antd khác (chưa có trong base.css)? Thêm rule global vào `base.css` nhắm
selector `.ant-*` tương ứng (dùng `!important` vì cssinjs của antd có sẵn), bám biến `--antadmin-*`.
Dự án cũng có thể tự thêm CSS override trong app.

## Tuỳ biến brand

Token nằm ở `packages/theme/src/tokens.ts` — đổi một chỗ, lan toả mọi app. Thay mã màu placeholder
bằng brand guideline chính thức của tập đoàn.
