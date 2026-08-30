---
"@antadmin/nuxt-layer-base": patch
---

Bổ sung `CFilterBar` vào khai báo `GlobalComponents` trong `antadmin.d.ts` — component đã được đăng ký global qua `@antadmin/ui` nhưng thiếu type, khiến template dùng `<CFilterBar>` không có gợi ý type/IntelliSense.
