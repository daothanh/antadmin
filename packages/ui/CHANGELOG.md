# @antadmin/ui

## 2.0.1

### Patch Changes

- @antadmin/theme@2.0.1
  - @antadmin/utils@2.0.1

## 2.0.0

### Minor Changes

- 793f68a: CTable có bộ lọc dựng sẵn: drawer chứa form lọc + thanh điều kiện lọc phía trên bảng; useTable giữ bộ lọc khi đổi trang
  
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
- f5d4680: CTable có drawer Thiết lập: đổi thứ tự/ẩn cột, sắp xếp mặc định, lưu localStorage theo từng bảng
  
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

### Patch Changes

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
- 1e256fe: Sửa `index.d.ts` của `@antadmin/ui` lỗi TS2749 (`$nextTick: nextTick`); build Storybook không còn chạy plugin d.ts
  
  Không đổi API và runtime. Type của `components` giữ nguyên ý nghĩa.
  
  - **d.ts publish hỏng**: map `components` (install.ts) để TS tự suy luận nên d.ts in lại nguyên cây type từng component.
    Type của `CTable` chứa instance `CButton` (template ref), trong đó có `typeof import('vue').nextTick`. api-extractor
    (`rollupTypes`) viết lại thành `$nextTick: nextTick` (mất `typeof`), consumer đặt `skipLibCheck: false` gặp TS2749.
    Nay `components` khai báo type tường minh `{ CTable: typeof CTable, … }`: `index.d.ts` hết lỗi và gọn từ 1815 xuống
    1007 dòng.
  - **Chốt chặn lúc build**: `vite.config.ts` báo lỗi `[@antadmin/ui]` khi d.ts sinh ra có `typeof import(...)`, không để
    phát hành d.ts hỏng. Test/story không còn sinh d.ts.
  - **Storybook** (job Docs trên GitHub fail): `.storybook/main.ts` bỏ plugin `vite:dts` kế thừa từ `vite.config.ts`.
    Trước đây Storybook bỏ `build.lib` nên plugin chạy api-extractor lại trên `dist/index.d.ts`, ghi đè file đó và đổ
    `.d.ts` vào `storybook-static`.
- c6284bd: Bỏ `eslint-disable` khỏi test của `@antadmin/ui`; ngoại lệ lint cho stub antdv chuyển thành override có tên trong `eslint.config.mjs`
  
  Không đổi API, component và file publish.
  
  - 5 file test (`CChat`, `CFilterBar`, `CForm`, `CTable`, `CTableFilterDrawer`) bỏ dòng
    `/* eslint-disable vue/one-component-per-file */` ở đầu file, đúng quy ước repo cấm `eslint-disable`. Directive trong
    `CForm.test.ts` vốn không dùng tới (ESLint báo "Unused eslint-disable directive").
  - Override `antadmin/ui-test-stubs` chỉ tắt `vue/one-component-per-file` cho `**/*.test.ts`, vì file test gom nhiều stub
    antdv trong factory `vi.mock('ant-design-vue')`. Component `.vue`, story và code nguồn vẫn áp rule.
  - Stub `ATextarea`/`AAlert` trong `CChat.test.ts` khai báo `default` cho prop nên hết 2 cảnh báo `vue/require-default-prop`.
    `pnpm --filter @antadmin/ui exec eslint . --max-warnings 0` giờ sạch.
- Updated dependencies [5b8d509]
- Updated dependencies [f5d4680]
- Updated dependencies [0f9f389]
- Updated dependencies [ce392cf]
- Updated dependencies [c6eaaa6]
- Updated dependencies [087dcf0]
- Updated dependencies [979286d]
  - @antadmin/theme@2.0.0
  - @antadmin/utils@2.0.0

## 1.3.1

### Patch Changes

- 06d0133: Phát hành lại artifact npm `1.3.1` được đóng gói qua pnpm (rewrite `workspace:*` thành version semver cụ
  thể lúc pack), sửa lỗi `1.3.0` khiến consumer cài ngoài monorepo thất bại vì dependency runtime vẫn mang
  `workspace:*`. Nguồn trong repo giữ `workspace:*` để luôn link source local khi phát triển.
- @antadmin/theme@1.3.1
  - @antadmin/utils@1.3.1

## 1.3.0

### Minor Changes

- Thêm `CChat` và `CChatMessage` cho UI chat AI, wired bằng props/emit với `useAiChat`.

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

- Sửa lỗi TS7022 khi Vite sinh declaration cho CForm/CTable forward slot.

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
