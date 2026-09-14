# @antadmin/nuxt-layer-base

**Entry point duy nhất** team sản phẩm cần. Nuxt layer gom design system, auth IAM, BFF, auto-import.

## Dùng
```ts
// nuxt.config.ts của team sản phẩm
export default defineNuxtConfig({
  extends: ['@antadmin/nuxt-layer-base'],
})
```

## Layer cung cấp
- **Theme/UI**: `app.vue` bọc `<a-config-provider>` áp `@antadmin/theme` + locale `vi_VN` của antdv; plugin `app.use(AntAdminUI)` đăng ký `C*`; inject CSS vars `--antadmin-*`. SSR style qua `@ant-design-vue/nuxt`.
- **Auth (BFF + abstract)**: plugin cung cấp `$antadminAuth` (mặc định form đăng nhập first-party, BFF đổi credential lấy token IAM), khởi tạo user state. Trang `/auth/login` bọc `<AntAdminLoginForm>`. Middleware `auth.global` (chuyển tới `/auth/login`) + `permission.global` (route meta `permissions`).
- **Composables auto-import**: `useApi/useAuth/usePermission/useTable`.
- **Nitro BFF**:
  - `/api/**` → proxy tới `apiProxyTarget`, gắn `Authorization` từ session (token httpOnly cookie).
  - `POST /auth/login` · `GET /auth/clients` · `POST /auth/otp/send` · `GET /auth/session` · `GET /auth/logout` — đổi credential lấy token ở IAM rồi seal vào cookie httpOnly; `NUXT_AUTH_MOCK=true` trả dữ liệu giả cho dev.
- **runtimeConfig**: `session.secret`, `auth.*` (endpoint + mapping IAM), `apiProxyTarget`, `public.apiBaseURL`, `public.auth.*` (cấu hình form).
- **Dark mode**: `useThemeMode()` (`mode`/`isDark`/`toggle`/`setMode`) — lưu qua cookie, `app.vue` đổi antd algorithm + CSS vars theo runtime.

## Cấu hình (env)
```
# BẮT BUỘC production: khoá mã hoá/ký cookie session (AES-256-GCM). openssl rand -base64 32
NUXT_SESSION_SECRET=...
# Cổng IAM (bọc /iam + /auth); endpoint + mapping mặc định khớp IAM AntAdmin
NUXT_AUTH_BASE_URL=https://api.antadmin.com/cop
NUXT_API_PROXY_TARGET=https://gateway.antadmin.vn
# DEV không có IAM: bỏ qua đăng nhập thật
NUXT_AUTH_MOCK=true
```

Endpoint, mapping field và cấu hình form đăng nhập: xem [Auth & Permission](https://daothanh.github.io/antadmin/guide/auth).

## Override
Team định nghĩa lại file cùng path (vd `app/middleware/auth.global.ts`, `app/app.config.ts`) — Nuxt ưu tiên layer gần nhất. Route công khai: `definePageMeta({ auth: false })`.

## Bảo mật — điều BẮT BUỘC nắm

- **`auth.global` / `permission.global` chỉ là hàng rào phía CLIENT** (app render CSR). Chúng cải thiện UX (ẩn trang, redirect login) **nhưng KHÔNG phải lớp bảo mật**. Nguồn sự thật là **backend gateway**: mọi endpoint phải tự kiểm tra quyền dựa trên Bearer token do BFF gắn. Đừng bao giờ để dữ liệu nhạy cảm chỉ được bảo vệ bởi `definePageMeta({ permissions })`.
- **Session cookie** được mã hoá + ký bằng AES-256-GCM (`server/utils/session.ts`). Production **phải** đặt `NUXT_SESSION_SECRET` (≥ 32 ký tự); thiếu → server báo lỗi. Dev dùng secret tạm + cảnh báo.
- **BFF là nguồn auth duy nhất**: `/api/**` strip `Authorization`/`Cookie` do client gửi, chỉ gắn token từ session; access token hết hạn thì bị bỏ để backend trả 401 (session IAM không giữ refresh token nên phải đăng nhập lại).
- **Redirect** ở `/auth/*` chỉ nhận đường dẫn nội bộ (chống open redirect).
