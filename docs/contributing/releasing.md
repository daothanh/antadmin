# Release

Dùng [Changesets](https://github.com/changesets/changesets). Các package `@antadmin/*` đi
**lockstep** (`fixed`), publish lên private registry GitLab/Nexus (`access: restricted`).

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

```bash
# publish bản beta thủ công (nếu cần)
pnpm changeset pre enter beta
pnpm changeset version && pnpm -w build && pnpm changeset publish --tag beta
pnpm changeset pre exit
```

## Pipeline (CI)

`.gitlab-ci.yml` ở root:

- **quality** (mọi nhánh): `pnpm lint && pnpm typecheck && pnpm build`.
- **release** (nhánh `main`): `pnpm build && pnpm changeset publish`.

Bump version + changelog chạy bằng `pnpm changeset version` (commit vào `main` qua "version MR"
hoặc bước thủ công trước khi release). CI publish các package có version mới hơn registry.

Chi tiết cấu hình registry/token (instance vs project endpoint, các gotcha 401): xem
[Cấu hình .npmrc](./npmrc).

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
  4. Core team Maintainer chạy `pnpm changeset pre exit` + version MR như quy trình release
     thường (mục "Quy trình release" trong [Triển khai Git](./git-workflow)).
