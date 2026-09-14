# __APP_NAME__

Project Nuxt 4 dựng từ framework AntAdmin (`extends @antadmin/nuxt-layer-base`).

## Bắt đầu
```bash
cp .env.example .env   # cấu hình IAM/backend, hoặc đặt NUXT_AUTH_MOCK=true để dev bỏ qua đăng nhập
pnpm install
pnpm dev
```

> Dùng pnpm theo bản pin ở `packageManager` (`corepack enable` tự chọn đúng bản).
> `pnpm-workspace.yaml` đã quyết định sẵn build script (`allowBuilds`) cho dependency của template. Thêm dependency
> có build script thì `pnpm install` báo `ERR_PNPM_IGNORED_BUILDS` và ghi placeholder vào file đó: đổi thành
> `true`/`false` (hoặc chạy `pnpm approve-builds`) rồi commit, không thì Docker/CI cũng fail.
> Đặt app vào một pnpm workspace có sẵn: xoá `pnpm-workspace.yaml` của app, chuyển `allowBuilds` lên workspace gốc.
> Nếu gặp lỗi module lạ của nuxt sau khi đổi config, cài lại sạch:
> `rm -rf node_modules .nuxt pnpm-lock.yaml && pnpm install`.

## Có sẵn từ layer
- Theme antdv + component `C*` (CButton, CTable, CForm...).
- Composable auto-import: `useApi`, `useAuth`, `usePermission`, `useTable`.
- Auth IAM (form đăng nhập qua BFF) + middleware `auth.global` / `permission.global`.
- BFF: `/api/**` proxy backend, `/auth/**` đăng nhập/phiên với IAM.

## Trang mẫu
- `app/pages/index.vue` — trang chủ công khai + đăng nhập/đăng xuất.
- `app/pages/orders/index.vue` — **danh sách mẫu** chạy offline ngay: `CPageHeader` +
  `useTable` + `CTable` (phân trang/sort) + `CStatus`/`CTag` + nút gating bằng `usePermission`.
  Đổi fetcher demo sang `useApi('/orders')` khi nối backend (xem comment trong file).

## Quy ước
- Route công khai: `definePageMeta({ auth: false })`.
- Yêu cầu quyền: `definePageMeta({ permissions: ['order.read'] })`.
- Gọi API: `const api = useApi(); await api('/endpoint')`.
- **Không** import trực tiếp `ant-design-vue` — dùng `@antadmin/ui` (ESLint sẽ chặn).

## Deploy

`.gitlab-ci.yml` build Docker image và tự deploy nhánh `dev` lên máy dev; nhánh
`main`/tag chỉ build+push image. Trước khi dùng, đổi `REGISTRY_HOST`/`IMAGE` trong
`.gitlab-ci.yml` và `scripts/deploy-prod.sh` cho khớp registry thật của team.

```bash
docker compose up --build          # chạy thử image production ở local
./scripts/deploy-prod.sh <tag>     # deploy prod thủ công (nếu prod cô lập khỏi GitLab)
```
