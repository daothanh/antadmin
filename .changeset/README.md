# Changesets

Thư mục này chứa các "changeset" — mô tả thay đổi để tự động bump version + sinh changelog.

## Quy trình
1. Sau khi sửa code, chạy: `pnpm changeset`
2. Chọn package bị ảnh hưởng + loại bump (patch / minor / **major nếu breaking**)
3. Viết mô tả thay đổi (sẽ vào CHANGELOG)
4. Commit file `.md` được sinh ra trong thư mục này cùng PR

## Lưu ý cấu hình
- `fixed: [["@antadmin/*"]]` → tất cả package `@antadmin/*` **lockstep** cùng một version, giảm ma trận tương thích.
- `access: restricted` → publish private lên registry GitLab/Nexus.
- `baseBranch: main` → so sánh thay đổi với nhánh `main`.

CI sẽ chạy `changeset version` (bump + changelog) rồi `changeset publish` khi merge vào `main`.
