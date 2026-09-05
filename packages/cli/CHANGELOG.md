# @antadmin/cli

## 1.3.0

### Minor Changes

- Scaffold bổ sung CI/CD Docker/GitLab Runner, `CLAUDE.md` và guardrail cho AI coding assistant.

### Patch Changes

- ef370ac: feat(cli): scaffold kèm trang danh sách mẫu chạy được ngay (`app/pages/orders`) —
  minh hoạ `CPageHeader` + `useTable` + `CTable` (phân trang/sort) + `CStatus`/`CTag`
  và nút gating bằng `usePermission`. Kèm mục nav "Đơn hàng" trong `app.config.ts`.
- Bỏ cấu hình registry private và MCP khỏi scaffold; package framework public được cài trực tiếp từ npmjs.

## 1.2.1

## 1.2.0

### Patch Changes

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

## 1.0.3

## 1.0.2

### Patch Changes

- create-antadmin-app: bỏ trường `pnpm.onlyBuiltDependencies` trong package.json (pnpm mới
  không còn đọc → gây cảnh báo). Thêm hướng dẫn `pnpm approve-builds` và cài lại sạch vào README mẫu.

## 1.0.1

### Patch Changes

- create-antadmin-app: thêm `pnpm.onlyBuiltDependencies` (@parcel/watcher, esbuild) vào
  project template để `pnpm install` không bị chặn build script (tránh ERR_PNPM_IGNORED_BUILDS,
  đảm bảo nuxt dev/build chạy được).

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
