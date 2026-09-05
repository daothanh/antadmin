# AI tooling cho dev

Bộ công cụ để Claude Code / Cursor làm việc đúng chuẩn framework trong repo core. App scaffold tạo
`CLAUDE.md` và guardrail; MCP nội bộ không được cấu hình cho consumer public.

## Có sẵn trong repo

| File | Vai trò |
|---|---|
| `CLAUDE.md` | Context chuẩn cho AI: kiến trúc, quy ước, gotchas — AI đọc mỗi session |
| `.claude/settings.json` | Guardrail: allow sẵn lệnh lint/test/build + git read-only; **deny** đọc `.env*`, `~/.npmrc`, force-push |

## MCP server core-only

Phơi tri thức framework cho AI — component `C*` (props/emits thật, không đoán), design token
`--antadmin-*`, docs + gotchas, danh sách package:

| Tool | Trả về |
|---|---|
| `list_components` / `get_component` | Danh sách / chi tiết component @antadmin/ui |
| `list_tokens` | Token light/dark từ @antadmin/theme |
| `search_docs` | Tra cứu docs + gotchas theo từ khoá |
| `list_packages` | Package @antadmin/* + version + vai trò |

Dữ liệu **sinh lúc build** trong repository core. `@antadmin/mcp` là package private và không chạy qua
`npx` trong repository sản phẩm.

## Thiết lập mỗi dev làm 1 lần

```bash
# ~/.zshrc — PAT GitLab scope `api` cho MCP gitlab
export GITLAB_TOKEN=glpat-...
```

Kiểm tra trong repo core: mở Claude Code và hỏi "CChat có những props nào?" — trả lời đúng props
nghĩa là MCP `antadmin` chạy.

## Skill nội bộ (repo core)

| Skill | Việc |
|---|---|
| `/new-component <Tên>` | Tạo component `C*` đủ bộ: component + stories + test + đăng ký 3 chỗ (`index.ts`, `install.ts`, `antadmin.d.ts`) + changeset |

## AI review trên MR

Job CI `ai-review` chạy Claude Code headless review mỗi MR: bám quy ước CLAUDE.md, soi vi phạm
kiến trúc / bug / thiếu changeset / security, post comment lên MR. `allow_failure` — chỉ tham
khảo, người duyệt vẫn quyết. Prompt ở `.claude/ci-review-prompt.md`.

## Biến cần cấu hình (admin làm 1 lần)

| Biến | Đặt ở | Dùng cho |
|---|---|---|
| `ANTHROPIC_API_KEY` | CI/CD Variables (masked) | Job `ai-review` |
| `GITLAB_REVIEW_TOKEN` | CI/CD Variables (masked) — PAT scope `api`, role ≥ Reporter | Post comment MR |
| `AI_GATEWAY_URL` / `AI_GATEWAY_KEY` | CI/CD Variables (masked) | Job `ai-eval` |
| `GITLAB_TOKEN` | Shell mỗi dev | MCP `gitlab` |
