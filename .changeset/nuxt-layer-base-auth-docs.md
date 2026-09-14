---
'@antadmin/nuxt-layer-base': patch
---

README và comment của `@antadmin/nuxt-layer-base` mô tả đúng đăng nhập IAM thay cho OIDC

Không đổi API và runtime.

- README: auth là form đăng nhập first-party, BFF đổi credential lấy token IAM. Liệt kê đúng các route `/auth/*` (bỏ
  `/auth/callback` không tồn tại). Khối env dùng `NUXT_AUTH_BASE_URL` và `NUXT_AUTH_MOCK` thay cho `NUXT_OIDC_*` và
  `NUXT_OIDC_MOCK`. Access token hết hạn thì phải đăng nhập lại, vì session IAM không giữ refresh token.
- `nuxt.config.ts`: comment của `apiProxyTarget` ghi tên env `NUXT_API_PROXY_TARGET`.
- Plugin `02.auth.ts`: bỏ comment nhắc OIDC là mặc định và callback ở `/auth/callback`.
