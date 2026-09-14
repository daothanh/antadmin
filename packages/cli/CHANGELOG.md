# @antadmin/cli

## 2.0.1

### Patch Changes

- ee1f988: `create-antadmin-app` và README của template hướng dẫn bỏ qua đăng nhập khi dev bằng `NUXT_AUTH_MOCK=true` thay cho `NUXT_OIDC_MOCK=true`
  
  Không đổi API và runtime. Layer đăng nhập qua IAM, cờ bỏ qua đăng nhập là `runtimeConfig.auth.mock` (`NUXT_AUTH_MOCK`),
  khớp `.env.example`, `CLAUDE.md` của template và docs Auth. `NUXT_OIDC_MOCK` không bỏ qua đăng nhập (phần OIDC còn sót
  đọc cờ này cũng đã gỡ khỏi layer), nên làm theo hướng dẫn cũ vẫn phải đăng nhập IAM thật.
  
  - Lời nhắc sau khi scaffold và mục "Bắt đầu" trong README template: cấu hình IAM/backend hoặc `NUXT_AUTH_MOCK=true`.
  - README template: mục "Có sẵn từ layer" mô tả auth là đăng nhập IAM qua BFF thay vì OIDC.
- c85195b: Sửa app scaffold bằng `create-antadmin-app` fail `pnpm install` và `pnpm typecheck` khi đặt ngoài monorepo (pnpm 12)
  
  Không đổi API và runtime. Lỗi có sẵn (tái hiện trên cả 1.3.1 và 2.0.0), làm script `check`, stage `check` của
  `Dockerfile` và job check trong `.gitlab-ci.yml` của app mới fail ngay từ đầu. Monorepo không gặp vì có `allowBuilds` ở
  `pnpm-workspace.yaml` gốc và `@types/node` được hoist từ package khác.
  
  - **`pnpm install` thoát lỗi `ERR_PNPM_IGNORED_BUILDS`** (`@antadmin/cli`): pnpm 11+ chặn build script của dependency và
    fail khi còn package chưa được quyết định (`esbuild`, `core-js`). Template thêm `pnpm-workspace.yaml` khai báo
    `allowBuilds` (`esbuild`, `@parcel/watcher` được chạy; `core-js` bị chặn), `Dockerfile` copy file này trước
    `pnpm install --frozen-lockfile`. `package.json` pin `packageManager` cùng bản pnpm của core, để corepack trong Docker/CI
    cài đúng bản thay vì bản mặc định của corepack.
  - **`pnpm typecheck` báo TS2307 `node:crypto` và TS2591 `Buffer`** (`@antadmin/nuxt-layer-base`): app typecheck thẳng
    source `server/utils/{session,iam,oidc}.ts` của layer nhưng không có type Node. Layer khai báo `@types/node` trong
    `dependencies` và các file dùng API Node có `/// <reference types="node" />`, nên app không cần tự cài `@types/node`.
    App tạo từ template cũ cũng hết lỗi sau khi nâng layer.
  - App tạo từ template cũ vẫn fail `pnpm install` với pnpm 11+ cho tới khi chép `pnpm-workspace.yaml`, field
    `packageManager` và dòng `COPY` trong `Dockerfile` từ template mới (sau đó chạy `pnpm install` để ghi bản pnpm vào
    `pnpm-lock.yaml`).
  - Test `S-REGR-05` (`pnpm test:release`) chặn tái phát: template thiếu `allowBuilds`/`packageManager`, `Dockerfile` không
    copy `pnpm-workspace.yaml`, hoặc server util dùng API Node mà không tham chiếu type Node.
- 387adbc: Template scaffold khai báo `engines.node` khớp yêu cầu của Nuxt 4.5 (`^22.19.0 || ^24.11.0 || >=26.0.0`)
  
  Không đổi API và runtime. Template cài `nuxt@^4.0.0` nên app mới nhận Nuxt 4.5, bản chỉ hỗ trợ Node 22.19+, 24.11+ và
  26+. Giá trị cũ `>=20.19.0` ghi sai là chạy được trên Node 20, 23 và 25.
  
  - pnpm 12 không chặn cài đặt theo `engines.node` của chính project, nên đổi này không làm fail `pnpm install` hay Docker
    build (`node:24-alpine`).
  - App tạo từ template cũ nên sửa `engines.node` trong `package.json` theo cùng giá trị.

## 2.0.0

### Major Changes

- 1bec556: eslint: nâng lên ESLint 10 (major)
  
  - `@antadmin/eslint-config` chỉ hỗ trợ ESLint 10 — peer dependency `eslint@^10`; bộ deps nâng đồng bộ (`@eslint/js` 10, `eslint-plugin-vue` 10, `vue-eslint-parser` 10, `typescript-eslint` 8.69+). Yêu cầu Node >= 20.19.
  - Template scaffold của `@antadmin/cli` cài `eslint@^10` và `engines.node >= 20.19`.
  - Recommended configs mới có thể báo thêm lỗi (no-unassigned-vars, no-useless-assignment, preserve-caught-error, vue/block-order...); chạy lại `pnpm lint` sau khi nâng cấp.
  - Migration: xem Migration Guide `v1 → v2`.

### Patch Changes

- d4bbd28: docs: chuyển tài liệu framework từ Cloudflare Pages sang GitHub Pages — cập nhật URL docs trong template scaffold (`templates/app/CLAUDE.md`)

## 1.3.1

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
