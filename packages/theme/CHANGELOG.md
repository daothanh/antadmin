# @antadmin/theme

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
