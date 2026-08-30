# Cấu hình npmjs.com và trusted publishing

Các package `@antadmin/*` được publish public lên npmjs.com. Repo không cần redirect scope
`@antadmin` trong `.npmrc` và consumer không cần token để cài package.

## Consumer

Cài trực tiếp từ registry npm mặc định:

```bash
pnpm add @antadmin/nuxt-layer-base
```

Không thêm `@antadmin:registry`, `NPM_TOKEN` hoặc `NODE_AUTH_TOKEN` vào project consumer chỉ để đọc
các package public.

## Package metadata

Mỗi `packages/*/package.json` khai báo:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/daothanh/antadmin.git",
    "directory": "packages/<tên-thư-mục>"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  }
}
```

## Trusted publisher trên npmjs.com

Maintainer cấu hình trusted publisher cho từng package `@antadmin/*` trong npmjs.com với:

- Organization/user GitHub: `daothanh`
- Repository: `antadmin`
- Workflow: `release.yml`

Workflow `.github/workflows/release.yml` chạy trên GitHub-hosted runner. Quyền OIDC
`id-token: write` chỉ nằm ở job `publish`; các job chọn mode, version và pack không có quyền này.
Không tạo secret npm dự phòng trong GitHub Actions.

Trusted publishing yêu cầu Node.js từ `22.14.0` và npm từ `11.5.1`; workflow dùng Node.js 24.
GitHub repository cũng phải cho phép Actions tạo/cập nhật pull request để job `version` quản lý PR
version.

## Kiểm tra local

```bash
pnpm test:release
```

Lệnh này kiểm tra graph release, quyền OIDC, metadata của toàn bộ package và việc gỡ job release npm
cũ khỏi GitLab CI. Lệnh không publish package.
