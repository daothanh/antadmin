# Triển khai Git

Hướng dẫn đưa monorepo core lên Git (GitLab) và quy trình làm việc hằng ngày.

## 1. Khởi tạo remote (lần đầu)

Repo đã có lịch sử local trên nhánh `main`. Tạo project trống trên GitLab rồi:

```bash
git remote add origin git@gitlab.antadmin.vn:frontend/framework-core.git
git push -u origin main
```

> `main` là nhánh release. Đừng force-push lên `main`.

## 2. Branch model (trunk-based)

```
main ────●────●────●────●───▶   (luôn xanh, là nguồn release)
          \        /
  feat/*    ●──●──●   (nhánh ngắn, merge qua MR)
```

- Nhánh tính năng: `feat/<scope>`, sửa lỗi: `fix/<scope>`, tài liệu: `docs/<scope>`.
- Nhánh **ngắn ngày**, rebase theo `main` thường xuyên, merge qua **Merge Request**.
- Không commit thẳng lên `main`.

```bash
git switch -c feat/use-table-filters
# ... code ...
pnpm lint && pnpm typecheck && pnpm build
pnpm changeset            # nếu có đổi package
git push -u origin feat/use-table-filters
# mở Merge Request trên GitLab
```

## 3. Commit convention

Dùng [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`,
`chore:`, `refactor:`, `test:`. Scope theo package: `feat(ui): ...`, `fix(composables): ...`.

> Conventional Commits là cho lịch sử git. **Bump version + changelog do Changesets quyết định**
> (xem [Release](./releasing)). Mỗi MR đổi package **bắt buộc** kèm một changeset.

## 4. Bảo vệ nhánh main (GitLab settings)

- Settings → Repository → **Protected branches**: `main` = Maintainers push, no force-push.
- Settings → Merge requests: bật **Pipelines must succeed** + **All threads resolved**.
- Yêu cầu tối thiểu 1 approval cho MR.
- Bật **Code Owner approval** (Settings → Merge requests → Merge request approvals) để file
  `CODEOWNERS` ở root repo thật sự chặn merge theo package — nếu không bật, file chỉ mang tính
  tham khảo. Owner trong `CODEOWNERS` hiện là placeholder (`@team-ui-owners`...),
  phải tạo group GitLab thật khớp tên trước khi bật rule này.

### Quyền cho dev team sản phẩm đóng góp vào core

Team sản phẩm dev trên repo riêng — để mở MR vào core, cấp:
- **Developer** trên project `framework-core` (không Maintainer).
- **Reporter ở group `antadmin`** (để PAT cá nhân cài `@antadmin/*` từ registry khi `pnpm install`
  monorepo core — xem gotcha registry trong CLAUDE.md).

Dùng **direct-branch, không fork**: job CI `ai-review`/`ai-eval` cần biến bảo mật
(`ANTHROPIC_API_KEY`, `GITLAB_REVIEW_TOKEN`) mà fork thường không kế thừa; team sản phẩm là nội
bộ AntAdmin nên rủi ro thấp hơn mô hình fork công khai.

## 5. Thiết lập release trên GitHub/npmjs.com

- Trong npmjs.com, cấu hình trusted publisher cho từng package với owner `daothanh`, repository
  `antadmin` và workflow `release.yml`.
- Trong GitHub Actions settings, cho phép workflow tạo/cập nhật pull request để Changesets quản lý
  PR version.
- Không tạo `NPM_TOKEN` hoặc `NODE_AUTH_TOKEN`; job publish xác thực bằng OIDC.
- `.gitlab-ci.yml` tiếp tục chạy quality, AI review/eval và deploy Pages, không publish package.

## 6. Quy trình release

```bash
# 1) Merge thay đổi kèm changeset vào main.
# 2) GitHub Actions mở/cập nhật PR version (bump lockstep + changelog).
# 3) Merge PR version vào main; workflow build, pack và publish qua npm OIDC.
```

Tag nên gắn theo version (Changesets/CI có thể tạo `@antadmin/...@x.y.z`). Channel `beta`/`next`:
xem [Release](./releasing).

## 7. Repo team sản phẩm (riêng biệt)

Mỗi sản phẩm là **repo riêng**, không clone monorepo core:

```bash
npx @antadmin/cli antadmin-orders     # đã có .gitlab-ci.yml + .npmrc
cd antadmin-orders && git init && git add -A && git commit -m "chore: init"
git remote add origin git@gitlab.antadmin.vn:product/antadmin-orders.git
git push -u origin main
```

CI của team sản phẩm cũng cần biến `NPM_TOKEN` để cài `@antadmin/*` từ registry.

## 8. .gitignore

Đã loại trừ `node_modules`, `dist`, `.nuxt`, `.output`, `.turbo`, `storybook-static`,
`.vitepress/cache`, `.env*` (giữ `.env.example`). Không commit secrets.

## 9. Checklist thao tác thủ công GitLab (làm 1 lần khi setup quy trình đóng góp)

Các mục dưới đây chỉ admin/Maintainer GitLab bật được qua UI Settings — không thể làm qua sửa
file trong repo:

1. **Protected branches**: xác nhận `main` chặn push trực tiếp, chỉ merge qua MR (mục 4).
2. **Merge request settings**: bật "Pipelines must succeed", "All threads resolved" (mục 4).
3. **Merge request approvals**: ≥1 approval + bật **"Code Owner approval"** — nếu không bật,
   `CODEOWNERS` (root repo) không chặn gì cả, chỉ mang tính tham khảo.
4. **Members**: cấp Developer (project `framework-core`) + Reporter (group `antadmin`) cho từng dev
   team sản phẩm tham gia đóng góp.
5. **CI/CD Variables**: xác nhận `ANTHROPIC_API_KEY`, `GITLAB_REVIEW_TOKEN` đã Masked + Protected
   đúng scope.
6. **Tạo GitLab group thật** khớp tên dùng trong `CODEOWNERS` (thay các placeholder
   `@team-ui-owners`, `@team-composables-owners`, `@team-theme-owners`, `@team-platform-owners`,
   `@team-ai-owners`, `@core-team`) — làm **trước** mục 3.
7. **Tạo labels**: `rfc`, `contribution::t1-fix`, `contribution::t2-feature`,
   `contribution::t3-breaking`, `status::needs-rfc`, `status::good-first-contribution`,
   `status::declined`, `needs-beta-validation`, `feature-request`.
8. **Release npmjs.com**: cấu hình trusted publisher cho cả 10 package và cho phép GitHub Actions
   tạo/cập nhật pull request (mục 5).
