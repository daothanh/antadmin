# Release

Dùng [Changesets](https://github.com/changesets/changesets). Chín package public đi **lockstep**
(`fixed`) và publish lên npmjs.com (`access: public`). `@antadmin/mcp` là core-only, private và không
tham gia release public.

## Quy trình hằng ngày

Mỗi MR có thay đổi ảnh hưởng package phải kèm changeset:

```bash
pnpm changeset
# chọn package + mức bump (patch/minor/major); major = breaking
```

File `.md` sinh ra trong `.changeset/` commit cùng MR.

## Cadence & channels

- `latest`: release ổn định theo cadence cố định (vd 2 tuần/lần).
- `next` / `beta`: dist-tag để team sản phẩm test trước.

Beta/next phải đi qua workflow GitHub Actions để giữ OIDC/provenance; không chạy `changeset publish`
từ local khi không có cơ chế xác thực npm tương ứng.

## Pipeline release

`.github/workflows/release.yml` chạy khi push vào `main` theo graph Changesets v3:

1. `select-mode` chọn `version`, `publish` hoặc không làm gì.
2. Mode `version` mở/cập nhật PR bump version và changelog.
3. Mode `publish` chạy lint, typecheck, test và release contract; chỉ sau đó build package, tạo
   artifact đóng gói rồi job riêng publish lên npmjs.com.

Chỉ job `publish` có quyền OIDC `id-token: write`; workflow dùng npm trusted publishing và không
lưu `NPM_TOKEN`/`NODE_AUTH_TOKEN`. GitLab CI vẫn giữ các job AI; docs + Storybook deploy qua
[GitHub Actions](/contributing/git-workflow).

Chi tiết registry và thiết lập trusted publisher: xem [Cấu hình .npmrc](./npmrc).

## Breaking change

- Bump **major** + viết mục [Migration Guide](/guide/migration) tương ứng.
- Ưu tiên phát hành qua `beta` để team sản phẩm migrate sớm.

## Vai trò trong validate qua beta/next

- **Ai bump**: Maintainer core team, kích hoạt thủ công khi một MR T2/T3 (xem
  [RFC Process](./rfc) cho định nghĩa tầng) quan trọng vừa merge vào `main` và cần test rộng
  trước cadence release chính thức. Gắn nhãn `needs-beta-validation` lên MR/issue theo dõi —
  không tự động hoá theo mọi merge để tránh spam registry.
- **Ai test**: team sản phẩm bị ảnh hưởng trực tiếp (được nêu trong RFC/MR hoặc comment core
  team) — bump dist-tag `beta` trong repo sản phẩm của họ, test trên staging.
- **Tiêu chí promote lên `latest`**:
  1. ≥1 team sản phẩm khác đội đề xuất xác nhận test OK trên `beta` (comment trên MR/issue theo
     dõi).
  2. Không có bug report mới trong ≥3 ngày làm việc kể từ lần publish beta gần nhất.
  3. Nếu breaking: Migration Guide đã có, ≥1 team migrate thử thành công.
   4. Core team Maintainer chạy `pnpm changeset pre exit` + version PR như quy trình release
     thường (mục "Quy trình release" trong [Triển khai Git](./git-workflow)).
