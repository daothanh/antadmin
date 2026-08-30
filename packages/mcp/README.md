# @antadmin/mcp

MCP server **nội bộ** phơi tri thức framework AntAdmin cho AI của team sản phẩm (Claude Code,
Cursor…). Giúp AI dùng đúng component/token/quy ước thay vì đoán hoặc import antdv thẳng.

## Tool

| Tool | Mô tả |
|---|---|
| `list_components` | Danh sách component C* (@antadmin/ui) + mô tả + số props |
| `get_component` | Chi tiết 1 component: props (kiểu, mặc định, JSDoc), emits, đường dẫn |
| `list_tokens` | Design token `--antadmin-*` (light/dark) từ @antadmin/theme, lọc theo tên |
| `search_docs` | Tra cứu docs framework + gotchas CLAUDE.md theo từ khoá |
| `list_packages` | Liệt kê package @antadmin/* + version + vai trò |

## Cách hoạt động

Tri thức được **sinh lúc build** (`scripts/generate.ts`) từ nguồn core vào `data/*.json` và ship
kèm package → server chạy **standalone** trong repo sản phẩm, không cần monorepo core. Chạy lại
`pnpm build` mỗi khi component/token/docs đổi (CI release lo việc này).

## Dùng trong repo sản phẩm

App scaffold bằng `@antadmin/cli` đã có sẵn trong `.mcp.json`:

```json
{
  "mcpServers": {
    "antadmin": { "command": "npx", "args": ["-y", "@antadmin/mcp"] }
  }
}
```

Cần `.npmrc` trỏ scope `@antadmin` tới GitLab group registry (như khi cài các `@antadmin/*` khác).

## Phát triển

```bash
pnpm --filter @antadmin/mcp build   # generate data + bundle
pnpm --filter @antadmin/mcp test    # test logic parse/format/search
```
