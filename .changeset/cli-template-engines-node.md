---
'@antadmin/cli': patch
---

Template scaffold khai báo `engines.node` khớp yêu cầu của Nuxt 4.5 (`^22.19.0 || ^24.11.0 || >=26.0.0`)

Không đổi API và runtime. Template cài `nuxt@^4.0.0` nên app mới nhận Nuxt 4.5, bản chỉ hỗ trợ Node 22.19+, 24.11+ và
26+. Giá trị cũ `>=20.19.0` ghi sai là chạy được trên Node 20, 23 và 25.

- pnpm 12 không chặn cài đặt theo `engines.node` của chính project, nên đổi này không làm fail `pnpm install` hay Docker
  build (`node:24-alpine`).
- App tạo từ template cũ nên sửa `engines.node` trong `package.json` theo cùng giá trị.
