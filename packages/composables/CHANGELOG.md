# @antadmin/composables

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
  - @antadmin/utils@1.2.1

## 1.2.0

### Minor Changes

- 85bcd87: Đăng nhập bằng form (first-party) cấu hình được, thay luồng OIDC redirect

  Thêm luồng đăng nhập bằng form ngay trên app (chọn ứng dụng + username/password +
  phương thức xác thực + OTP) theo mô hình BFF: credential chỉ POST tới Nitro, token
  seal trong cookie httpOnly, client không giữ accessToken.

  **Cấu hình theo dự án (đổi backend chỉ là đổi env):**

  - `runtimeConfig.auth` (server-only): `baseURL`, `endpoints.{login,userInfo,clients,otpSend}`,
    `mapping.*` (dot-path bóc token/roles/permissions từ response), `mock`. Override qua
    `NUXT_AUTH_*`. Route BFF (`/auth/login`, `/auth/clients`, `/auth/otp/send`) là hợp đồng
    cố định; đổi IAM không đụng client.
  - `runtimeConfig.public.auth`: `methods` (google/telegram), `showClientSelect`,
    `defaultClientCode`. Override qua `NUXT_PUBLIC_AUTH_*`.

  **Component tái sử dụng:**

  - `<AntAdminLoginForm>` (auto-import) — tuỳ biến nhãn/logo/phương thức/dropdown qua props,
    fallback về `public.auth`. Dự án có thể override `pages/auth/login.vue` mà vẫn dùng lại.
  - Telegram có bước "Gửi mã" (countdown); Google Authenticator nhập mã trực tiếp.

  **Thay đổi:**

  - Thay luồng OIDC redirect: gỡ `auth/login.get.ts` + `auth/callback.get.ts`; `/auth/login`
    giờ là Vue page. `useAuth().loginWithPassword()` + `AuthProvider.loginWithPassword()`.
    `oidc.ts` giữ lại để refresh token khi backend cấp token OIDC.
  - `mock` (đặt `NUXT_AUTH_MOCK=true`) dựng session + danh sách app giả để chạy end-to-end.
  - Thêm test cho `getByPath`/`mapIamUser`/`mapIamTokens`.

  **Khớp IAM AntAdmin thật (api.antadmin.com/cop):**

  - Endpoint mặc định: login `/auth/auth/login-v1`, userInfo `/iam/user/userInfo` (POST,
    header `authorization` thô không `Bearer`), clients `/iam/client/findAll`, otp
    `/auth/auth/login/request`. `clientId` gửi lên là CODE ứng dụng (vd `WP_HRM`).
  - Mapping: roles=`body.listRole` (object `.code`), permissions=`body.authorization`
    (object `.rsCode`); id=`body.userId`, name=`body.fullName`.
  - token/refresh/expiresIn nằm trong `body.tokenData.{access_token,refresh_token,expires_in}`
    của login-v1 (đã verify end-to-end với user 2FA-off).
  - **Cookie giữ token + identity tối thiểu**: accessToken JWT ~2.4KB và permissions
    hàng trăm mục vượt giới hạn 4KB cookie → roles/permissions lấy tươi ở `/auth/session`
    qua userInfo (cookie thực đo ~3.5KB). Không lưu refreshToken (token IAM sống 24h).
  - ⚠ authenMethod telegram=2 là giả định (google=1 đã verify) — chỉnh khi có spec 2FA Telegram.

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

### Patch Changes

- Updated dependencies [efb0a61]
- Updated dependencies [120a8a3]
- Updated dependencies [489474f]
- Updated dependencies [996ecdb]
- Updated dependencies [dbe1e9c]
  - @antadmin/theme@1.2.0
  - @antadmin/utils@1.2.0

## 1.1.0

### Patch Changes

- @antadmin/utils@1.1.0

## 1.0.3

### Patch Changes

- @antadmin/utils@1.0.3

## 1.0.2

### Patch Changes

- @antadmin/utils@1.0.2

## 1.0.1

### Patch Changes

- @antadmin/utils@1.0.1

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
  - @antadmin/utils@1.0.0
