---
'@antadmin/nuxt-layer-base': patch
---

Gỡ phần OIDC còn sót trong `@antadmin/nuxt-layer-base`

Đăng nhập OIDC đã gỡ từ 1.2.0, sau đó layer đăng nhập bằng form first-party qua IAM. Phần OIDC giữ lại không còn tác dụng:
session IAM không lưu refresh token nên nhánh refresh ở `/api/**` không bao giờ chạy, và không có phiên IdP nào để
đăng xuất.

- Xoá `server/utils/oidc.ts`. Nitro không còn auto-import `getOidcMetadata`, `generatePkce`, `randomState`,
  `refreshAccessToken`, `mapUserInfo` và các type `Oidc*` sang app.
- Xoá `runtimeConfig.oidc`, nên env `NUXT_OIDC_*` (kể cả `NUXT_OIDC_MOCK`) không còn tác dụng.
- `/api/**`: access token hết hạn thì bỏ token để backend trả 401, không thử refresh.
- `/auth/logout`: xoá session rồi redirect về đường dẫn nội bộ, không chuyển tới end_session_endpoint của IdP.
- `AntAdminSession` bỏ field `refreshToken`.
- App tự dùng các hàm OIDC auto-import, đọc `useRuntimeConfig().oidc` hoặc truyền `refreshToken` vào
  `setAntAdminSession` cần bỏ phần đó. Trong monorepo không có nơi nào dùng.
