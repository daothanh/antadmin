# CI/CD & Deploy

App scaffold từ `@antadmin/cli` đi kèm sẵn CI/CD dựa trên hạ tầng đã triển khai thực tế
cho một sản phẩm AntAdmin: build + deploy bằng Docker trên **một GitLab Runner
executor=shell** cài trên máy dev (không cần `docker:dind`, không cần image k8s).

## File sinh ra

| File | Vai trò |
|---|---|
| `Dockerfile` | Đa stage: `base` (cài deps bằng pnpm) → `check` (lint+typecheck, dùng cho CI) → `builder` (Nitro build) → `runner` (image production, chỉ copy `.output`) |
| `.gitlab-ci.yml` | Stage `check` → `build` → `deploy`; xem chi tiết bên dưới |
| `docker-compose.yml` | Build + chạy thử image production ở local (`docker compose up --build`) |
| `docker-compose.dev.yml` | Dùng bởi job `deploy:dev` — không chạy tay |
| `docker-compose.prod.yml` | Dùng bởi `scripts/deploy-prod.sh` trên máy prod |
| `scripts/deploy-prod.sh` | Deploy prod thủ công khi máy prod bị cô lập khỏi GitLab |

## Luồng CI

```
MR                → check (lint + typecheck, chạy trong docker build --target check)
dev               → check → build+push image → deploy lên máy dev (tự động)
main / tag        → check → build+push image (prod pull thủ công qua script)
```

Package `@antadmin/*` public được cài trực tiếp từ npmjs trong Docker build; không cần npm token hoặc
BuildKit secret cho package framework.

## Trước khi dùng — bắt buộc chỉnh theo hạ tầng thật của team

- Đổi `REGISTRY_HOST` / `IMAGE` trong `.gitlab-ci.yml` và `scripts/deploy-prod.sh`
  cho khớp registry image + namespace thật (mặc định là placeholder).
- Đổi `tags: [dev]` nếu team dùng runner/tag khác.
- Đổi cổng map trong `docker-compose.dev.yml` (`3001:3000`) nếu máy dev đã có app
  khác chiếm cổng.
- Nếu prod của team **không** bị cô lập khỏi GitLab, có thể thêm job `deploy:prod`
  tương tự `deploy:dev` với rule nhánh `main` + `when: manual`, thay vì chạy
  `scripts/deploy-prod.sh` thủ công.

## Biến CI/CD cần khai báo

Settings → CI/CD → Variables (đánh dấu **Masked**, **Protected** cho nhánh `dev`/`main`):

| Biến | Ý nghĩa |
|---|---|
| `REGISTRY_USER`, `REGISTRY_PASSWORD` | Đăng nhập registry image |
| `NUXT_SESSION_SECRET` | Khoá ký cookie session — bắt buộc ở production |
| `NUXT_AUTH_BASE_URL` | URL IAM/gateway (compose có default nếu để trống) |

## Deploy prod thủ công

```bash
# Trên máy prod, cạnh docker-compose.prod.yml + .env (xem .env.example)
./scripts/deploy-prod.sh <SHA ngắn | main | vX.Y.Z>
```
