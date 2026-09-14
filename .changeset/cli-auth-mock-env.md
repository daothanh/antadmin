---
'@antadmin/cli': patch
---

`create-antadmin-app` và README của template hướng dẫn bỏ qua đăng nhập khi dev bằng `NUXT_AUTH_MOCK=true` thay cho `NUXT_OIDC_MOCK=true`

Không đổi API và runtime. Layer đăng nhập qua IAM, cờ bỏ qua đăng nhập là `runtimeConfig.auth.mock` (`NUXT_AUTH_MOCK`),
khớp `.env.example`, `CLAUDE.md` của template và docs Auth. `NUXT_OIDC_MOCK` không bỏ qua đăng nhập (phần OIDC còn sót
đọc cờ này cũng đã gỡ khỏi layer), nên làm theo hướng dẫn cũ vẫn phải đăng nhập IAM thật.

- Lời nhắc sau khi scaffold và mục "Bắt đầu" trong README template: cấu hình IAM/backend hoặc `NUXT_AUTH_MOCK=true`.
- README template: mục "Có sẵn từ layer" mô tả auth là đăng nhập IAM qua BFF thay vì OIDC.
