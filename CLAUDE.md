# CLAUDE.md — AntAdmin Framework Core

Framework FE nội bộ AntAdmin (Nuxt 4 + Ant Design Vue), mô hình **1 team core → nhiều team sản phẩm**.
Core publish 9 package framework lên npmjs.com; team sản phẩm consume qua semver và
`extends @antadmin/nuxt-layer-base`. `@antadmin/mcp` là core-only. Docs: https://daothanh.github.io/antadmin — ngôn ngữ repo: **tiếng Việt**
(comment, commit, docs đều viết tiếng Việt).

## Lệnh thường dùng

```bash
pnpm build | lint | typecheck | test   # chạy qua Turborepo (dependsOn ^build)
pnpm --filter @antadmin/ui test           # test 1 package
pnpm --filter @antadmin/ui storybook      # Storybook cho UI
pnpm --filter docs dev                 # VitePress docs
pnpm turbo run dev --filter=playground # app test layer (qua turbo → tự build package phụ thuộc trước)
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
| `@antadmin/mcp` | MCP server tri thức framework core-only (component/token/docs/package) — data sinh lúc `pnpm build` từ nguồn core |
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
- **Public npm**: consumer cài 9 package framework từ npmjs mặc định, không thêm scope registry hay token.
  MCP không phải dependency public.
- **Chạy playground khi package chưa build** (vd sau `pnpm clean`) → `[TSCONFIG_ERROR] Failed to load tsconfig
  '../packages/nuxt-layer-base/.nuxt/tsconfig.json'`: layer chưa `nuxi prepare`, các package thiếu `dist`. Chạy dev
  qua turbo (task `dev` có `^build`), đừng `pnpm --filter playground dev`; server đang lỗi phải restart (Vite cache lỗi tsconfig).

## Release

1. Mỗi MR đổi package phải kèm `.changeset/*.md` (`pnpm changeset`).
2. Release: GitHub Actions tạo Version PR; sau khi merge, workflow publish lên npmjs bằng OIDC.
3. Trusted publisher cấu hình từng package public; không lưu npm write token trong CI.

## Trước khi mở MR

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```
