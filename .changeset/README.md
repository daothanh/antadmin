# Changesets

Thư mục này chứa các "changeset" — mô tả thay đổi để tự động bump version + sinh changelog.

## Quy trình
1. Sau khi sửa code, chạy: `pnpm changeset`
2. Chọn package bị ảnh hưởng + loại bump (patch / minor / **major nếu breaking**)
3. Viết mô tả thay đổi (sẽ vào CHANGELOG)
4. Commit file `.md` được sinh ra trong thư mục này cùng PR

## Lưu ý cấu hình
- `fixed` liệt kê rõ 9 package public **lockstep** cùng một version, giảm ma trận tương thích.
  `@antadmin/mcp` là package private/core-only và không thuộc fixed group.
- `access: public` → publish public lên npmjs.com.
- `baseBranch: main` → so sánh thay đổi với nhánh `main`.

GitHub Actions dùng Changesets v3 để tự mở PR version hoặc đóng gói và publish qua npm trusted
publishing khi merge vào `main`; workflow không lưu npm token.
