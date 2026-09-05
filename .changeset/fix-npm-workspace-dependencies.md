---
"@antadmin/ai": patch
"@antadmin/composables": patch
"@antadmin/ui": patch
"@antadmin/nuxt-layer-base": patch
---

Phát hành lại artifact npm `1.3.1` được đóng gói qua pnpm (rewrite `workspace:*` thành version semver cụ
thể lúc pack), sửa lỗi `1.3.0` khiến consumer cài ngoài monorepo thất bại vì dependency runtime vẫn mang
`workspace:*`. Nguồn trong repo giữ `workspace:*` để luôn link source local khi phát triển.
