# @antadmin/mcp

MCP server **core-only** phơi tri thức framework AntAdmin cho AI của đội core. Package này không
được publish lên npmjs; team sản phẩm dùng tài liệu public của framework.

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

## Phát triển

```bash
pnpm --filter @antadmin/mcp build   # generate data + bundle
pnpm --filter @antadmin/mcp test    # test logic parse/format/search
```
