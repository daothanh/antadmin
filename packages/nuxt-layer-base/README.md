# @antadmin/nuxt-layer-base

**Entry point duy nhất** team sản phẩm cần. Nuxt layer gom design system, auth/SSO, BFF, auto-import.

## Dùng
```ts
// nuxt.config.ts của team sản phẩm
export default defineNuxtConfig({
  extends: ['@antadmin/nuxt-layer-base'],
})
```

## Layer cung cấp
- **Theme/UI**: `app.vue` bọc `<a-config-provider>` áp `@antadmin/theme` + locale `vi_VN` của antdv; plugin `app.use(AntAdminUI)` đăng ký `C*`; inject CSS vars `--antadmin-*`. SSR style qua `@ant-design-vue/nuxt`.
- **Auth (BFF + abstract)**: plugin cung cấp `$antadminAuth` (mặc định OIDC), khởi tạo user state. Middleware `auth.global` (redirect login) + `permission.global` (route meta `permissions`).
- **Composables auto-import**: `useApi/useAuth/usePermission/useTable`.
- **Nitro BFF**:
  - `/api/**` → proxy tới `apiProxyTarget`, gắn `Authorization` từ session (token httpOnly cookie).
  - `/auth/login` · `/auth/callback` · `/auth/logout` · `/auth/session` — OIDC auth-code + PKCE; có `mock` mode cho dev.
- **runtimeConfig**: `session.secret`, `oidc.*`, `apiProxyTarget`, `public.apiBaseURL`.
- **Dark mode**: `useThemeMode()` (`mode`/`isDark`/`toggle`/`setMode`) — lưu qua cookie, `app.vue` đổi antd algorithm + CSS vars theo runtime.

## Cấu hình (env)
```
# BẮT BUỘC production: khoá mã hoá/ký cookie session (AES-256-GCM). openssl rand -base64 32
NUXT_SESSION_SECRET=...
NUXT_OIDC_ISSUER=...        NUXT_OIDC_CLIENT_ID=...      NUXT_OIDC_CLIENT_SECRET=...
NUXT_OIDC_REDIRECT_URI=https://app/auth/callback
NUXT_API_PROXY_TARGET=https://gateway.antadmin.vn
# DEV bỏ qua IdP:
NUXT_OIDC_MOCK=true
```

## Override
Team định nghĩa lại file cùng path (vd `app/middleware/auth.global.ts`, `app/app.config.ts`) — Nuxt ưu tiên layer gần nhất. Route công khai: `definePageMeta({ auth: false })`.

## Bảo mật — điều BẮT BUỘC nắm

- **`auth.global` / `permission.global` chỉ là hàng rào phía CLIENT** (app render CSR). Chúng cải thiện UX (ẩn trang, redirect login) **nhưng KHÔNG phải lớp bảo mật**. Nguồn sự thật là **backend gateway**: mọi endpoint phải tự kiểm tra quyền dựa trên Bearer token do BFF gắn. Đừng bao giờ để dữ liệu nhạy cảm chỉ được bảo vệ bởi `definePageMeta({ permissions })`.
- **Session cookie** được mã hoá + ký bằng AES-256-GCM (`server/utils/session.ts`). Production **phải** đặt `NUXT_SESSION_SECRET` (≥ 32 ký tự); thiếu → server báo lỗi. Dev dùng secret tạm + cảnh báo.
- **BFF là nguồn auth duy nhất**: `/api/**` strip `Authorization`/`Cookie` do client gửi, chỉ gắn token từ session; access token hết hạn sẽ tự refresh (nếu có refresh_token) hoặc bị bỏ.
- **Redirect** ở `/auth/*` chỉ nhận đường dẫn nội bộ (chống open redirect).
