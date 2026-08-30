# CLAUDE.md — AntAdmin Framework Core

Framework FE nội bộ AntAdmin (Nuxt 4 + Ant Design Vue), mô hình **1 team core → nhiều team sản phẩm**.
Core publish `@antadmin/*` lên GitLab Package Registry (group `antadmin`); team sản phẩm consume qua semver
và `extends @antadmin/nuxt-layer-base`. Docs: https://web.docs.vtii.vn — ngôn ngữ repo: **tiếng Việt**
(comment, commit, docs đều viết tiếng Việt).

## Lệnh thường dùng

```bash
pnpm build | lint | typecheck | test   # chạy qua Turborepo (dependsOn ^build)
pnpm --filter @antadmin/ui test           # test 1 package
pnpm --filter @antadmin/ui storybook      # Storybook cho UI
pnpm --filter docs dev                 # VitePress docs
pnpm --filter playground dev           # app test layer
pnpm changeset                         # BẮT BUỘC khi đổi package (major = breaking)
pnpm --filter @antadmin/ai eval           # eval prompt library (cần AI_GATEWAY_URL/KEY)
```

Test = Vitest. `composables` / `ui` / `utils` / `ai` / `mcp` có **coverage gate** — thêm code
phải kèm test, không là fail CI. Đổi prompt trong `@antadmin/ai` → tăng `version` + thêm eval case.

## Cấu trúc packages

| Package | Vai trò |
|---|---|
| `@antadmin/theme` | Design token + antd theme (ConfigProvider) + CSS vars, dark mode runtime |
| `@antadmin/ui` | Wrapper antdv, component prefix `C*` (CButton, CTable…), mỗi component kèm `.stories.ts` |
| `@antadmin/composables` | useApi / useAuth / usePermission / useTable / useTheme — **không phụ thuộc `ui`** |
| `@antadmin/utils` | Helper TS thuần (AppError, phân trang…) — không phụ thuộc Nuxt |
| `@antadmin/nuxt-layer-base` | Nuxt layer + Nitro BFF (server/api catch-all `[...].ts`) + IAM login — entry point duy nhất của team sản phẩm |
| `@antadmin/cli` | create-antadmin-app (scaffold) |
| `@antadmin/ai` | useAiChat streaming + createAiChatProxy (BFF→gateway OpenAI-compatible, key server-side) + `/prompts` (definePrompt có version) + `/eval` |
| `@antadmin/mcp` | MCP server tri thức framework (component/token/docs/package) — data sinh lúc `pnpm build` từ nguồn core, ship kèm package |
| `eslint-config` / `tsconfig` | Config dùng chung |

## Quy tắc kiến trúc (vi phạm = reject MR)

- **Không import `ant-design-vue` trực tiếp** ngoài `@antadmin/ui`. App/sản phẩm chỉ dùng `C*`.
- `composables` không phụ thuộc `ui`; `utils` không phụ thuộc Nuxt.
- Tối đa **2 tầng Nuxt layer**; khoá chặt version `nuxt` / `ant-design-vue`.
- Core chỉ giữ thứ thực sự dùng chung — business logic của một sản phẩm không được vào core.
- Đổi core ảnh hưởng nhiều team → mở **RFC** trước (`docs/contributing/rfc.md`).

## Gotchas đã trả giá — đừng lặp lại

- **antd-vue bỏ qua `theme.components`** trong ConfigProvider: style component-level phải làm bằng
  global CSS (base.css trong theme), KHÔNG cấu hình qua token `components`.
- **SSR với antd-vue kém** → hybrid rendering: `routeRules` đặt `ssr: false` mặc định cho page,
  vẫn giữ Nitro BFF. Đừng bật SSR lại cho page dùng antdv nếu chưa test kỹ.
- **Đăng nhập IAM**: form login qua endpoint IAM AntAdmin; `userInfo` gọi bằng **POST không kèm Bearer**;
  cookie chỉ giữ token (giới hạn 4KB) — không nhét thêm profile vào cookie.
- **Registry 404 với người ngoài team core**: scope `@antadmin` phải trỏ **group endpoint**
  (`/api/v4/groups/antadmin/-/packages/npm/`), auth bằng Group Deploy Token scope
  `read_package_registry`. PAT cá nhân chỉ hoạt động khi user là member (≥ Reporter).

## Release

1. Mỗi MR đổi package phải kèm `.changeset/*.md` (`pnpm changeset`).
2. Release: `pnpm release` (CI) = build + `changeset publish` lên GitLab registry.
3. Token: install dùng `read_package_registry`, publish trong CI dùng `write_package_registry`.
   **Không bao giờ commit token** — luôn qua env `NPM_TOKEN`.

## Trước khi mở MR

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```
