# @antadmin/ui

## 1.3.0

### Minor Changes

- 5c1d097: feat: error handler toàn cục (3 tầng)

  - **@antadmin/utils**: helper phân loại lỗi — `isAuthError`/`isForbidden`/`isValidation`/`isServerError`/`isNetworkError`, `errorSeverity`, `getFieldErrors`.
  - **@antadmin/ui**: `useErrorHandler()` — hiển thị lỗi nhất quán (message cho lỗi thường, notification cho 5xx/network), gọi hook 401/403, dedupe toast, bỏ qua 422 để form tự xử lý. Router-agnostic.
  - **@antadmin/nuxt-layer-base**: plugin `04.error` (bắt lỗi Vue chưa xử lý + `$antadminError` để opt-in; 401 → redirect `/auth/login`) và trang `error.vue` fatal.

- dc44410: feat(ui): thêm component nghiệp vụ dùng chung

  - `CFilterBar` — thanh lọc/tìm kiếm chuẩn cho trang danh sách (pattern `useTable` + `CTable`);
    router-agnostic, phát `@search`/`@reset`, slot cắm control lọc tuỳ ý.
  - `useConfirm()` — hộp thoại xác nhận dạng promise (`confirm() => Promise<boolean>`),
    bọc `Modal.confirm` với style AntAdmin (hỗ trợ `danger`).

### Patch Changes

- Updated dependencies [5c1d097]
  - @antadmin/utils@1.3.0
  - @antadmin/theme@1.3.0

## 1.2.1

### Patch Changes

- 8f3c365: feat(auth): kiểm tra quyền theo URI (exact) cho route, link, action button

  Permission là URI (`type=web`), so khớp exact. Ba điểm gating:

  - **Route**: `definePageMeta({ permission: '/x/y' })` hoặc `permissions: [...]` → `permission.global` 403.
  - **Link/menu**: `NavItem.permission` → layout tự ẩn; `usePermission().filterByPermission(items)`.
  - **Action button**: directive `v-can="'/x/y'"` (ẩn) / `v-can:disable="'/x/y'"` (disable); component `<Can>` + slot `#fallback`.

  `usePermission` mở rộng: `can/canAccess/canAll/canAny/hasRole/hasAnyRole/filterByPermission`. Lõi thuần
  `createPermissionChecker` tách file `permission.ts` (test trực tiếp). Super-role bỏ qua mọi check, cấu
  hình qua `NUXT_PUBLIC_AUTH_SUPER_ROLES`.

  - @antadmin/theme@1.2.1

## 1.2.0

### Minor Changes

- efb0a61: CCard: biến thể `type` + sửa lỗi & nâng cấp

  - **`type`** (`default`/`primary`/`outline`/`filled`/`ghost`) nay có tác dụng: gắn class `c-card-<type>`; style ở `@antadmin/theme/base.css` (primary = header navy chữ trắng, outline = gạch primary, filled = header nền dịu, ghost = trong suốt). Kiểu hoá union (trước là `string` không dùng).
  - **Forward `$attrs`**: card nay nhận `style`/`class`/`id` từ component cha (trước bị rớt do `inheritAttrs:false` + 2 root không `v-bind`).
  - **Padding collapsible**: body để 0, phần thân dùng `--antadmin-card-padding-*` (density) thay vì padding mặc định antd; quản border bằng class (`:bordered=false`).
  - **@antadmin/theme**: thêm density `cardHeadingHeight` + `cardHeadingFontSize` → biến `--antadmin-card-heading-height` / `--antadmin-card-heading-font-size` (header Card cao/cỡ chữ chỉnh tập trung).

### Patch Changes

- dbe1e9c: Chuẩn hoá layout khớp chính xác OneAuto

  - **@antadmin/theme**: token sidebar đúng OneAuto `linear-gradient(#213368, #182544)` (`sidebarTop`/`sidebarBottom`). base.css sao y override OneAuto (`#left-side-menu`): menu trong suốt, chữ + icon (`.tabler-icon`) trắng UPPERCASE, item con thụt 35px bo tròn pill, **hover + active đều nền cam `#ff9800`**; header bảng `font-normal`; top menu UPPERCASE bold navy `#253264`, active đổi primary + gạch chân.
  - **@antadmin/ui** (`CAppLayout`): logo = chữ appTitle (bỏ ô vuông cam); dải logo + sider cùng gradient navy. **Thu gọn: ẩn logo, đổi icon trigger** (collapse ↔ expand kiểu tabler). Menu để Sider điều khiển collapse (bỏ `inline-collapsed` → hết warning antd).
  - **@antadmin/nuxt-layer-base**: account = icon người (dropdown tên/email/đăng xuất); chuông có chấm đỏ.

- 2e9a2ed: Giảm padding container + gap về 8px (mật độ gọn hơn)

  `CAppLayout` vùng nội dung (`.c-app__content`) padding 16px → 8px. Showcase playground cũng dùng gap 8px giữa các element cho khớp.

- Updated dependencies [efb0a61]
- Updated dependencies [120a8a3]
- Updated dependencies [489474f]
- Updated dependencies [996ecdb]
- Updated dependencies [dbe1e9c]
  - @antadmin/theme@1.2.0

## 1.1.0

### Minor Changes

- f8780d9: Layout shell chung để dự án kế thừa (tham khảo OneAuto)

  - **@antadmin/ui**: thêm `CAppLayout` (khung sider gradient + header + content cuộn + footer, slot-driven, `v-model:collapsed`) và `CSideNav` (menu sidebar inline từ config, router-agnostic — phát `@navigate`, tự tô sáng theo `activePath`, mở sẵn submenu cha). Export type `NavItem`.
  - **@antadmin/nuxt-layer-base**: thêm `app/layouts/default.vue` mặc định ráp shell + account dropdown (useAuth) + NuxtErrorBoundary; đọc `appTitle`/`footerText`/`nav` từ `app.config.ts`. Mở rộng `app.config` mặc định. Dự án chỉ cần khai báo `antadmin.nav` để có sidebar; muốn đổi khung thì override `app/layouts/default.vue`.
  - **@antadmin/cli**: template thêm `app/app.config.ts` mẫu (nav) và phụ thuộc `@antadmin/ui` (để import `NavItem` + component `C*`).

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

### Patch Changes

- Updated dependencies [eaf2440]
- Updated dependencies [28712d1]
  - @antadmin/theme@1.1.0

## 1.0.3

### Patch Changes

- @antadmin/theme@1.0.3

## 1.0.2

### Patch Changes

- @antadmin/theme@1.0.2

## 1.0.1

### Patch Changes

- @antadmin/theme@1.0.1

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

### Patch Changes

- Updated dependencies [f006fa4]
  - @antadmin/theme@1.0.0
