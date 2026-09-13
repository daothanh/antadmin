---
'@antadmin/cli': patch
'@antadmin/nuxt-layer-base': patch
---

Sửa app scaffold bằng `create-antadmin-app` fail `pnpm install` và `pnpm typecheck` khi đặt ngoài monorepo (pnpm 12)

Không đổi API và runtime. Lỗi có sẵn (tái hiện trên cả 1.3.1 và 2.0.0), làm script `check`, stage `check` của
`Dockerfile` và job check trong `.gitlab-ci.yml` của app mới fail ngay từ đầu. Monorepo không gặp vì có `allowBuilds` ở
`pnpm-workspace.yaml` gốc và `@types/node` được hoist từ package khác.

- **`pnpm install` thoát lỗi `ERR_PNPM_IGNORED_BUILDS`** (`@antadmin/cli`): pnpm 11+ chặn build script của dependency và
  fail khi còn package chưa được quyết định (`esbuild`, `core-js`). Template thêm `pnpm-workspace.yaml` khai báo
  `allowBuilds` (`esbuild`, `@parcel/watcher` được chạy; `core-js` bị chặn), `Dockerfile` copy file này trước
  `pnpm install --frozen-lockfile`. `package.json` pin `packageManager` cùng bản pnpm của core, để corepack trong Docker/CI
  cài đúng bản thay vì bản mặc định của corepack.
- **`pnpm typecheck` báo TS2307 `node:crypto` và TS2591 `Buffer`** (`@antadmin/nuxt-layer-base`): app typecheck thẳng
  source `server/utils/{session,iam,oidc}.ts` của layer nhưng không có type Node. Layer khai báo `@types/node` trong
  `dependencies` và các file dùng API Node có `/// <reference types="node" />`, nên app không cần tự cài `@types/node`.
  App tạo từ template cũ cũng hết lỗi sau khi nâng layer.
- App tạo từ template cũ vẫn fail `pnpm install` với pnpm 11+ cho tới khi chép `pnpm-workspace.yaml`, field
  `packageManager` và dòng `COPY` trong `Dockerfile` từ template mới (sau đó chạy `pnpm install` để ghi bản pnpm vào
  `pnpm-lock.yaml`).
- Test `S-REGR-05` (`pnpm test:release`) chặn tái phát: template thiếu `allowBuilds`/`packageManager`, `Dockerfile` không
  copy `pnpm-workspace.yaml`, hoặc server util dùng API Node mà không tham chiếu type Node.
