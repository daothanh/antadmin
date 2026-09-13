# @antadmin/theme

## 2.0.0

### Minor Changes

- ce392cf: Sửa tương phản WCAG AA (≥ 4.5:1) cho màu semantic, accent, nút danger và chữ màu antdv tự vẽ ở theme tối; thêm token màu chữ `accentText`, `successText`, `warningText`
  
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

### Patch Changes

- 5b8d509: CTable thành khung trang danh sách chuẩn; bật locale vi_VN của antdv cho toàn app
  
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
- 0f9f389: Sửa tương phản WCAG AA (≥ 4.5:1) cho token `primary` (theme tối) và `link` (theme sáng)
  
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
- c6eaaa6: Thêm Vitest cho `@antadmin/theme`; test khoá tương phản WCAG AA của các cặp token mà component đang dùng
  
  Không đổi API và giá trị token.
  
  - `pnpm --filter @antadmin/theme test` giờ chạy thật (`vitest run --coverage`).
  - Hàm thuần `luminanceOf` / `contrastRatioOf` tính tương phản theo WCAG 2.x (`src/contrast.ts`). Hiện chỉ test dùng nên
    chưa export ra package.
  - `css-vars.test.ts` đo trên `cssVars('light')` và `cssVars('dark')`, yêu cầu ≥ 4.5:1 cho:
    - primary, primary-hover, link, text-muted trên các nền component đang dùng (primary-soft, surface, surface-elevated,
      surface-muted, page);
    - chữ trắng trên primary-active, gradient-primary, gradient-danger (theme sáng thêm primary và error); chữ
      sidebar-bottom trên accent (CSideNav);
    - toàn bộ bảng cặp AA trong `docs/guide/theming.md`: `*-text` của accent/success/warning và primary/error/info, trên nền
      soft và surface;
    - error trên surface-elevated (item danger của Dropdown); success-text và error trên info-soft (CStatus trong hàng đang
      chọn của bảng).
  - Cặp đang biết là chưa đạt được ghi thành ngoại lệ kèm lý do. Test khẳng định cặp đó vẫn dưới ngưỡng; khi sửa đạt, test
    sẽ đỏ để nhắc gỡ ngoại lệ và khoá cặp lại. Hiện còn một cặp: text-subtle trên surface (mô tả CEmpty), 2.54:1 ở theme sáng,
    3.55:1 ở theme tối.
- 087dcf0: Sửa tương phản WCAG AA cho chữ mục chưa chọn của CTopNav ở theme tối
  
  - **@antadmin/theme — `base.css`**: mục chưa chọn của CTopNav (menu module ngang trên header `CAppLayout`) đổi màu chữ từ
    navy `#253264` tô cứng sang `--antadmin-color-text`.
    - Theme tối, trên `surface` `#162033`: 1.33 → 15.58:1. Trước đây chữ gần như chìm vào nền header.
    - Theme sáng: `#10213f` trên `#ffffff`, 12.22 → 16.01:1. Vẫn là tông navy, chỉ đậm hơn một nấc.
    - Mục đang chọn vẫn dùng `primary` + gạch chân. Màu hover không đổi, vì antdv vốn tô chữ hover bằng `colorText` (cùng
      giá trị `text`); hover vẫn được báo bằng gạch chân primary.
  - Test tương phản khoá thêm cặp `text` trên `surface` (≥ 4.5:1 ở cả hai theme). Không đổi API và giá trị token.
- 979286d: Bật ESLint cho `@antadmin/theme` — `pnpm lint` và CI giờ lint cả `src/*.ts` lẫn test Vitest `src/*.test.ts` của theme
  
  Không đổi API, giá trị token và file publish.
  
  - Trước đây package không có script `lint` nên Turbo bỏ qua theme khi chạy `pnpm lint`. Giờ đã thêm `eslint.config.mjs`
    theo mẫu `@antadmin/utils` (`base` + `noDirectAntdv`) và script `"lint": "eslint ."`.
  - `noDirectAntdv` khoá nguyên tắc theme không import `ant-design-vue` (giữ zero runtime dep).
  - Thêm devDependencies `@antadmin/eslint-config` (`workspace:*`) và `eslint` (`^10.10.0`), cùng version với các package
    khác. Code hiện có đã đạt lint, không phải sửa.

## 1.3.1

## 1.3.0

## 1.2.1

## 1.2.0

### Minor Changes

- 120a8a3: Cơ chế chỉnh mật độ component antd (padding / height / margin) tập trung

  Vì ant-design-vue 4.x bỏ qua `theme.components`, framework thêm nhóm **`density` trong tokens** làm nguồn duy nhất:

  - **Height** (Input/Select/Button/Picker) → global token `controlHeight`/`controlHeightSM`/`controlHeightLG`.
  - **Padding/margin** (Card body/head, Form item, Table cell, Modal/Drawer body) → global CSS trong `base.css`, đọc biến `--antadmin-*` (card-padding, form-item-margin, table-cell-padding, modal-body-padding).

  Chỉnh 1 chỗ (`packages/theme/src/tokens.ts` → `density`) lan toả mọi app. Mặc định gọn hơn antd (card/form/modal 24px → 12–16px). Docs: guide/theming mục "Mật độ component".

### Patch Changes

- efb0a61: CCard: biến thể `type` + sửa lỗi & nâng cấp

  - **`type`** (`default`/`primary`/`outline`/`filled`/`ghost`) nay có tác dụng: gắn class `c-card-<type>`; style ở `@antadmin/theme/base.css` (primary = header navy chữ trắng, outline = gạch primary, filled = header nền dịu, ghost = trong suốt). Kiểu hoá union (trước là `string` không dùng).
  - **Forward `$attrs`**: card nay nhận `style`/`class`/`id` từ component cha (trước bị rớt do `inheritAttrs:false` + 2 root không `v-bind`).
  - **Padding collapsible**: body để 0, phần thân dùng `--antadmin-card-padding-*` (density) thay vì padding mặc định antd; quản border bằng class (`:bordered=false`).
  - **@antadmin/theme**: thêm density `cardHeadingHeight` + `cardHeadingFontSize` → biến `--antadmin-card-heading-height` / `--antadmin-card-heading-font-size` (header Card cao/cỡ chữ chỉnh tập trung).

- 489474f: Gia cố bảo mật auth/BFF + dark mode runtime + bộ test

  **Bảo mật (quan trọng — cần đặt `NUXT_SESSION_SECRET` khi lên production):**

  - **Session cookie mã hoá + ký (AES-256-GCM)** thay cho base64 thuần — chống giả mạo/leo thang quyền. Khoá từ `NUXT_SESSION_SECRET` (bắt buộc ở production, ≥ 32 ký tự; dev có secret tạm + cảnh báo). Tách hàm thuần `sealAntAdminSession`/`unsealAntAdminSession` để test.
  - **Chống open redirect**: `/auth/login|callback|logout` chỉ nhận đường dẫn nội bộ (`sanitizeRedirect`).
  - **BFF là nguồn auth duy nhất**: `/api/**` strip `Authorization`/`Cookie` do client gửi (không rò rỉ `antadmin_session` sang backend); tự refresh access token khi hết hạn (nếu có refresh_token), hết hạn không refresh được thì bỏ token.
  - Bọc `JSON.parse` transaction trong callback (400 thay vì 500); timeout 10s cho OIDC discovery/refresh.
  - Tài liệu hoá rõ: `auth.global`/`permission.global` chỉ là gating phía client — backend phải tự enforce.

  **Tính năng:**

  - `useThemeMode()` (`mode`/`isDark`/`toggle`/`setMode`) — chuyển sáng/tối tại runtime, lưu qua cookie (SSR-safe). `app.vue` đổi antd algorithm + CSS vars `--antadmin-*` reactive; nút chuyển theme sẵn trong header layout mặc định.

  **Chất lượng:**

  - Thêm bộ test (vitest) cho `toAppError`, `useTable`, `sanitizeRedirect`, `seal/unseal session`, `mapUserInfo`; thêm bước `pnpm test` vào CI.

- 996ecdb: Tích hợp @nuxt/fonts (Quicksand + Montserrat, self-host)

  - **@antadmin/nuxt-layer-base**: thêm module `@nuxt/fonts` + cấu hình `fonts.families` (Quicksand 300–700, Montserrat 400–700, provider Google, subset vietnamese+latin) và `experimental.processCSSVariables` để dò font khai báo qua CSS variable. Font được self-host (phục vụ qua `/_fonts/`, không gọi runtime tới Google).
  - **@antadmin/theme** (`base.css`): khai báo `--antadmin-font-family` (Quicksand) và `--antadmin-font-family-heading` (Montserrat) tĩnh để `@nuxt/fonts` dò & tải; đồng bộ với token `fontStack`/`fontHeadingStack`.

  Kết quả: chữ thân = Quicksand, tiêu đề = Montserrat (khớp OneAuto). Đổi font chỉ cần sửa token + `fonts.families`.

- dbe1e9c: Chuẩn hoá layout khớp chính xác OneAuto

  - **@antadmin/theme**: token sidebar đúng OneAuto `linear-gradient(#213368, #182544)` (`sidebarTop`/`sidebarBottom`). base.css sao y override OneAuto (`#left-side-menu`): menu trong suốt, chữ + icon (`.tabler-icon`) trắng UPPERCASE, item con thụt 35px bo tròn pill, **hover + active đều nền cam `#ff9800`**; header bảng `font-normal`; top menu UPPERCASE bold navy `#253264`, active đổi primary + gạch chân.
  - **@antadmin/ui** (`CAppLayout`): logo = chữ appTitle (bỏ ô vuông cam); dải logo + sider cùng gradient navy. **Thu gọn: ẩn logo, đổi icon trigger** (collapse ↔ expand kiểu tabler). Menu để Sider điều khiển collapse (bỏ `inline-collapsed` → hết warning antd).
  - **@antadmin/nuxt-layer-base**: account = icon người (dropdown tên/email/đăng xuất); chuông có chấm đỏ.

## 1.1.0

### Minor Changes

- eaf2440: Layout giống OneAuto: top menu module + sidebar icon + active pill cam

  - **@antadmin/ui**: thêm `CTopNav` (menu module ngang trên header, router-agnostic). `CAppLayout` đổi bố cục theo OneAuto: dải logo + nút thu gọn ở góc trên-trái (navy), header trắng (slot `#header` cho top menu + `#actions`), dưới là sider gradient + content + footer.
  - **@antadmin/theme**: `base.css` — item sidebar active = **pill cam đặc, chữ trắng** (`.c-sidenav`), style menu module ngang (`.c-topnav`).
  - **@antadmin/nuxt-layer-base**: layout mặc định ráp `CTopNav` (từ `app.config.antadmin.topNav`) + chuông thông báo + account dropdown. Thêm `topNav` vào app.config.
  - **@antadmin/cli** + **playground**: ví dụ app.config có `topNav` và `nav` kèm icon (`@tabler/icons-vue`) để giống OneAuto.

- 28712d1: Bộ UI/UX design system (tham khảo OneAuto)

  **@antadmin/theme**

  - Mở rộng design token: palette navy `#203368` + accent cam `#ff9800`, các cấp surface/text/line, semantic soft color, gradient và shadow.
  - Bổ sung CSS variables `--antadmin-*` đầy đủ; thêm `@antadmin/theme/base.css` (reset, scrollbar, header bảng nền primary, menu active accent).
  - `getAntdTheme()` chỉ phát token toàn cục: ant-design-vue 4.x bỏ qua `theme.components`, nên tinh chỉnh cấp component chuyển sang `base.css`.

  **@antadmin/ui** — thêm component thương hiệu (đăng ký global): `CCard`, `CTag`, `CStatus`, `CEmpty`, `CStatistic`, `CPageHeader`, `CInputCurrency`, `CInputPercent`; re-export có kiểm soát nhiều primitive antdv dưới bí danh `C*` (CInput, CSelect, CModal, CDrawer, CDatePicker...). Export `@antadmin/ui/style.css`.

  > Thay đổi API: `CButton` nay dùng `variant` (`primary`/`secondary`/`outline`/`ghost`/`danger`/`link`/`text`) và `size` (`sm`/`md`/`lg`) thay cho `size` kiểu antd (`small`/`middle`/`large`). Cập nhật chỗ dùng nếu có.

  **@antadmin/nuxt-layer-base**: nạp sẵn `@antadmin/theme/base.css` + `@antadmin/ui/style.css`; cập nhật type augmentation `GlobalComponents` cho các component mới.

## 1.0.3

## 1.0.2

## 1.0.1

## 1.0.0

### Major Changes

- f006fa4: Phát hành ổn định đầu tiên (1.0.0) của framework FE nội bộ AntAdmin (Nuxt 4 + Ant Design Vue).

  Bao gồm:

  - `@antadmin/nuxt-layer-base`: Nuxt layer nền — theme + UI, auth/SSO (OIDC qua BFF), middleware auth/permission, Nitro proxy `/api/**`, auto-import composables.
  - `@antadmin/ui`: wrapper Ant Design Vue chuẩn hoá (CButton/CTable/CForm) + plugin AntAdminUI.
  - `@antadmin/composables`: useApi, useAuth, usePermission, useTable.
  - `@antadmin/theme`: design token → antdv theme + CSS variables.
  - `@antadmin/utils`: AppError + helper TS thuần.
  - `@antadmin/eslint-config`, `@antadmin/tsconfig`: convention dùng chung.
  - `@antadmin/cli`: create-antadmin-app scaffold project mới.
