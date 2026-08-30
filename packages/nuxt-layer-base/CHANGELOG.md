# @antadmin/nuxt-layer-base

## 1.4.0

### Patch Changes

- a28f45c: Bổ sung `CFilterBar` vào khai báo `GlobalComponents` trong `antadmin.d.ts` — component đã được đăng ký global qua `@antadmin/ui` nhưng thiếu type, khiến template dùng `<CFilterBar>` không có gợi ý type/IntelliSense.
- ae96b1a: Phát hành công khai toàn bộ package AntAdmin lên npmjs.com bằng trusted publishing của GitHub Actions.
- a28f45c: Thêm component chat AI: CChat (panel controlled — list auto-scroll + ô soạn, Enter gửi/Shift+Enter xuống dòng, chặn gửi giữa lúc gõ IME) và CChatMessage (bong bóng message + typing indicator). Thuần trình bày, wire với useAiChat của @antadmin/ai qua props/emit.
- Updated dependencies [a28f45c]
- Updated dependencies [ae96b1a]
- Updated dependencies [a28f45c]
  - @antadmin/ui@1.4.0
  - @antadmin/composables@1.4.0
  - @antadmin/theme@1.4.0
  - @antadmin/utils@1.4.0

## 1.3.0

### Minor Changes

- 5c1d097: feat: error handler toàn cục (3 tầng)

  - **@antadmin/utils**: helper phân loại lỗi — `isAuthError`/`isForbidden`/`isValidation`/`isServerError`/`isNetworkError`, `errorSeverity`, `getFieldErrors`.
  - **@antadmin/ui**: `useErrorHandler()` — hiển thị lỗi nhất quán (message cho lỗi thường, notification cho 5xx/network), gọi hook 401/403, dedupe toast, bỏ qua 422 để form tự xử lý. Router-agnostic.
  - **@antadmin/nuxt-layer-base**: plugin `04.error` (bắt lỗi Vue chưa xử lý + `$antadminError` để opt-in; 401 → redirect `/auth/login`) và trang `error.vue` fatal.

### Patch Changes

- Updated dependencies [5c1d097]
- Updated dependencies [dc44410]
  - @antadmin/utils@1.3.0
  - @antadmin/ui@1.3.0
  - @antadmin/composables@1.3.0
  - @antadmin/theme@1.3.0

## 1.2.1

### Patch Changes

- 92c4c0e: fix(auth): map permission theo `uri` thay vì `rsCode`

  `body.authorization[]` của userInfo có cả `rsCode` (mã + nhãn tiếng Việt) và `uri`
  (đường dẫn dùng để gating). Bản trước lấy nhầm `rsCode`. Nay tách key trích xuất cho
  từng loại và cho cấu hình: `mapping.roleKey` (mặc định `code`), `mapping.permissionKey`
  (mặc định `uri`) — override qua `NUXT_AUTH_MAPPING_ROLE_KEY`/`NUXT_AUTH_MAPPING_PERMISSION_KEY`.

  Ngoài ra **chỉ lấy permission `type='web'`** (dùng gating khi truy cập uri, tạo link,
  bấm action button) — cấu hình qua `mapping.permissionType` (mặc định `web`) và
  `mapping.permissionTypeKey` (mặc định `type`); để trống `permissionType` để không lọc.

- 8f3c365: feat(auth): kiểm tra quyền theo URI (exact) cho route, link, action button

  Permission là URI (`type=web`), so khớp exact. Ba điểm gating:

  - **Route**: `definePageMeta({ permission: '/x/y' })` hoặc `permissions: [...]` → `permission.global` 403.
  - **Link/menu**: `NavItem.permission` → layout tự ẩn; `usePermission().filterByPermission(items)`.
  - **Action button**: directive `v-can="'/x/y'"` (ẩn) / `v-can:disable="'/x/y'"` (disable); component `<Can>` + slot `#fallback`.

  `usePermission` mở rộng: `can/canAccess/canAll/canAny/hasRole/hasAnyRole/filterByPermission`. Lõi thuần
  `createPermissionChecker` tách file `permission.ts` (test trực tiếp). Super-role bỏ qua mọi check, cấu
  hình qua `NUXT_PUBLIC_AUTH_SUPER_ROLES`.

- Updated dependencies [8f3c365]
  - @antadmin/composables@1.2.1
  - @antadmin/ui@1.2.1
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

- 996ecdb: Tích hợp @nuxt/fonts (Quicksand + Montserrat, self-host)

  - **@antadmin/nuxt-layer-base**: thêm module `@nuxt/fonts` + cấu hình `fonts.families` (Quicksand 300–700, Montserrat 400–700, provider Google, subset vietnamese+latin) và `experimental.processCSSVariables` để dò font khai báo qua CSS variable. Font được self-host (phục vụ qua `/_fonts/`, không gọi runtime tới Google).
  - **@antadmin/theme** (`base.css`): khai báo `--antadmin-font-family` (Quicksand) và `--antadmin-font-family-heading` (Montserrat) tĩnh để `@nuxt/fonts` dò & tải; đồng bộ với token `fontStack`/`fontHeadingStack`.

  Kết quả: chữ thân = Quicksand, tiêu đề = Montserrat (khớp OneAuto). Đổi font chỉ cần sửa token + `fonts.families`.

### Patch Changes

- dbe1e9c: Chuẩn hoá layout khớp chính xác OneAuto

  - **@antadmin/theme**: token sidebar đúng OneAuto `linear-gradient(#213368, #182544)` (`sidebarTop`/`sidebarBottom`). base.css sao y override OneAuto (`#left-side-menu`): menu trong suốt, chữ + icon (`.tabler-icon`) trắng UPPERCASE, item con thụt 35px bo tròn pill, **hover + active đều nền cam `#ff9800`**; header bảng `font-normal`; top menu UPPERCASE bold navy `#253264`, active đổi primary + gạch chân.
  - **@antadmin/ui** (`CAppLayout`): logo = chữ appTitle (bỏ ô vuông cam); dải logo + sider cùng gradient navy. **Thu gọn: ẩn logo, đổi icon trigger** (collapse ↔ expand kiểu tabler). Menu để Sider điều khiển collapse (bỏ `inline-collapsed` → hết warning antd).
  - **@antadmin/nuxt-layer-base**: account = icon người (dropdown tên/email/đăng xuất); chuông có chấm đỏ.

- Updated dependencies [efb0a61]
- Updated dependencies [120a8a3]
- Updated dependencies [85bcd87]
- Updated dependencies [489474f]
- Updated dependencies [996ecdb]
- Updated dependencies [dbe1e9c]
- Updated dependencies [2e9a2ed]
  - @antadmin/ui@1.2.0
  - @antadmin/theme@1.2.0
  - @antadmin/composables@1.2.0
  - @antadmin/utils@1.2.0

## 1.1.0

### Minor Changes

- f8780d9: Layout shell chung để dự án kế thừa (tham khảo OneAuto)

  - **@antadmin/ui**: thêm `CAppLayout` (khung sider gradient + header + content cuộn + footer, slot-driven, `v-model:collapsed`) và `CSideNav` (menu sidebar inline từ config, router-agnostic — phát `@navigate`, tự tô sáng theo `activePath`, mở sẵn submenu cha). Export type `NavItem`.
  - **@antadmin/nuxt-layer-base**: thêm `app/layouts/default.vue` mặc định ráp shell + account dropdown (useAuth) + NuxtErrorBoundary; đọc `appTitle`/`footerText`/`nav` từ `app.config.ts`. Mở rộng `app.config` mặc định. Dự án chỉ cần khai báo `antadmin.nav` để có sidebar; muốn đổi khung thì override `app/layouts/default.vue`.
  - **@antadmin/cli**: template thêm `app/app.config.ts` mẫu (nav) và phụ thuộc `@antadmin/ui` (để import `NavItem` + component `C*`).

- 4053022: Hybrid rendering — mặc định CSR cho app (né lỗi SSR của Ant Design Vue)

  Ant Design Vue (cssinjs) hỗ trợ SSR chưa tốt (FOUC, hydration mismatch ở component dùng Teleport/responsive, message/notification mất theme). Vì **SSR ≠ BFF**, layer giữ `ssr: true` để Nitro/BFF (`/api`, `/auth`, cookie httpOnly) hoạt động, nhưng đặt `routeRules: { '/**': { ssr: false } }` → phần render component mặc định là client-side.

  - Hết FOUC/hydration mismatch của antd; BFF/SSO/`useApi`/permission giữ nguyên.
  - App nội bộ sau đăng nhập không cần SEO nên đây là lựa chọn an toàn nhất.
  - Trang công khai cần SEO/first-paint: dự án opt-in từng route, vd `routeRules: { '/landing': { ssr: true } }` (route SSR cần tự bọc `<client-only>` / dùng `App.useApp()` cho phần antd nhạy cảm).

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

- Updated dependencies [f8780d9]
- Updated dependencies [eaf2440]
- Updated dependencies [28712d1]
  - @antadmin/ui@1.1.0
  - @antadmin/theme@1.1.0
  - @antadmin/composables@1.1.0
  - @antadmin/utils@1.1.0

## 1.0.3

### Patch Changes

- Fix lỗi `Cannot find module nuxt/dist/app/types/augments` ở `nuxt dev` của project cài
  từ registry: thêm `build.transpile: ['@antadmin/ui', '@antadmin/composables']` để Vite xử lý
  các package runtime @antadmin (cài từ registry bị externalize → Node nạp thẳng nuxt app entry → vỡ).
  - @antadmin/composables@1.0.3
  - @antadmin/theme@1.0.3
  - @antadmin/ui@1.0.3
  - @antadmin/utils@1.0.3

## 1.0.2

### Patch Changes

- @antadmin/composables@1.0.2
- @antadmin/theme@1.0.2
- @antadmin/ui@1.0.2
- @antadmin/utils@1.0.2

## 1.0.1

### Patch Changes

- @antadmin/composables@1.0.1
- @antadmin/theme@1.0.1
- @antadmin/ui@1.0.1
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
  - @antadmin/ui@1.0.0
  - @antadmin/composables@1.0.0
  - @antadmin/theme@1.0.0
  - @antadmin/utils@1.0.0
