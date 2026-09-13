# Đóng góp — AntAdmin Framework Core

## Yêu cầu
- Node >= 20.19, pnpm >= 11.

## Access

Team sản phẩm dev trên repo **riêng** (không clone monorepo core). Để đóng góp vào core, cần quyền
write trên GitHub repository `daothanh/antadmin` để tạo branch và pull request; không push/merge thẳng
`main`. Package public cài từ npmjs, không cần PAT registry.

Review routing theo package qua [`CODEOWNERS`](./CODEOWNERS) — MR đổi `packages/ui/**` cần owner
UI duyệt, đổi `docs/contributing/**`/`CLAUDE.md`/CI luôn cần core team duyệt.

## Chỉ có ý tưởng, chưa muốn tự code?

Mở issue theo template **Feature Request** — không cần tự viết RFC/code, core team triage hàng
tuần. Xem [Cơ chế Feature Request](./docs/contributing/rfc.md#cơ-chế-feature-request-nhẹ).

## Bắt đầu
```bash
pnpm install
pnpm build        # build các package (turbo)
pnpm dev          # playground + docs, tự build package phụ thuộc (chỉ playground: pnpm turbo run dev --filter=playground)
```

## Kiểm tra trước khi mở MR
```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Changeset (bắt buộc khi đổi package)
```bash
pnpm changeset    # chọn package + mức bump; major = breaking
```
Commit file `.changeset/*.md` cùng MR. Chi tiết: [docs Release](./docs/contributing/releasing.md).

## RFC
Tính năng/đổi thay ở core ảnh hưởng nhiều team → mở RFC trước.
Xem [docs RFC](./docs/contributing/rfc.md).

## Tài liệu
```bash
pnpm --filter docs dev     # VitePress
```

## Nguyên tắc
- Core chỉ giữ thứ **thực sự dùng chung** — không nhồi business logic của một sản phẩm.
- Giữ tối đa 2 tầng layer; khoá version `nuxt`/`ant-design-vue` chặt.
- `composables` không phụ thuộc `ui`; không import trực tiếp `ant-design-vue` ngoài `@antadmin/ui`.
