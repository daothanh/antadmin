# CLAUDE.md — AntAdmin Framework Core

Framework FE nội bộ AntAdmin (Nuxt 4 + Ant Design Vue), mô hình **1 team core → nhiều team sản phẩm**.
Core publish 9 package framework lên npmjs.com; team sản phẩm consume qua semver và
`extends @antadmin/nuxt-layer-base`. `@antadmin/mcp` là core-only. Docs: https://daothanh.github.io/antadmin — ngôn ngữ repo: **tiếng Việt**
(comment, commit, docs, message lỗi, tên test, changeset và câu trả lời của AI đều viết tiếng Việt).

## Nguyên tắc làm việc

- Làm việc như Senior engineer của core team: đọc code liên quan trước khi sửa. Có thể tra nhanh qua MCP `antadmin`
  (`get_component`, `list_tokens`), nhưng source mới là nguồn sự thật. Không tự commit/push khi chưa được yêu cầu.
- Ảnh giao diện mẫu chỉ là demo: làm khung/hành vi dùng chung, không đưa cột hay nội dung demo vào component.
- Ưu tiên built-in sẵn có (`@tabler/icons-vue`, locale `vi_VN` của antdv) thay vì tự viết.

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

Test = Vitest. `composables` / `ui` / `utils` / `ai` / `mcp` có **coverage gate** (utils 95%, composables/ai/mcp 90%,
ui 85% lines) — thêm code phải kèm test, không là fail CI. Đổi prompt trong `@antadmin/ai` → tăng `version` + thêm eval case.

## Kiến trúc

Stack: TypeScript 5.7 · Nuxt 4 (Nitro/h3) · Ant Design Vue 4.2.6 · pnpm 12 + Turborepo · Vitest 3 · Storybook 8 ·
ESLint 10 flat config · Changesets (9 package chung version).

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

- **Phụ thuộc 1 chiều:** `utils`, `theme` (TS thuần) → `composables` (Nuxt) · `ui` (antdv) · `ai` (tuỳ chọn) →
  `nuxt-layer-base` → app sản phẩm. `playground/` là app thử layer, `docs/` là VitePress.
- **Luồng runtime:**
  1. Config của layer (`routeRules '/**': { ssr: false }`).
  2. Plugin `01.ui` → `02.auth` (`/auth/session` → `useState('antadmin:auth:user')`) → `03.permission` (`v-can`) → `04.error`.
  3. `app.vue`: `a-config-provider` + `vi_VN` + CSS vars.
  4. Middleware `auth.global` → `permission.global`.
  5. `layouts/default.vue`, menu lấy từ `app.config.ts`.
- **BFF:**
  - `/api/**` → `server/api/[...].ts`: giải mã cookie `antadmin_session` (AES-256-GCM, httpOnly), gắn `Bearer`,
    xoá `authorization`/`cookie` do client gửi, rồi proxy tới `apiProxyTarget`.
  - Login: `POST /auth/login` → IAM `login-v1` + `userInfo` → mã hoá vào cookie, chỉ chứa token và định danh.
- **State/routing:** không dùng Pinia (dùng `useState`, cookie, `app.config.ts`), không có lớp cache dữ liệu. Routing theo
  file với `RouteMeta { auth, permissions }`. Permission là URI so khớp chính xác; chặn quyền phía client chỉ phục vụ UX
  (backend vẫn phải tự kiểm tra).

## Quy tắc kiến trúc (vi phạm = reject MR)

- **Không import `ant-design-vue` trực tiếp** ngoài `@antadmin/ui` (layer được miễn). App/sản phẩm chỉ dùng `C*`, kể cả
  không viết thẻ `<a-*>` trong template (ESLint chưa bắt được).
- `composables` không phụ thuộc `ui`; `utils` không phụ thuộc Nuxt.
- Tối đa **2 tầng Nuxt layer**; khoá chặt version `nuxt` / `ant-design-vue`.
- Màu và spacing chỉ dùng `var(--antadmin-*)`; token mới phải thêm vào `@antadmin/theme` trước.
- Core chỉ giữ thứ thực sự dùng chung — business logic của một sản phẩm không được vào core.
- Đổi core ảnh hưởng nhiều team → mở **RFC** trước (`docs/contributing/rfc.md`).
- Không hardcode hay log token, secret, password.

## Coding conventions

**Chung**
- TypeScript `strict` + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`. Cấm `any` (kể cả trong template),
  `@ts-ignore`, `eslint-disable`, enum. Chỉ dùng `!`/`as` khi đã chứng minh được là đúng.
- Format: không `;`, nháy đơn, thụt 2 space, trailing comma khi xuống dòng, số lớn viết `10_000`. Comment giải thích
  *vì sao*; API public có JSDoc.
- Import:
  - Dùng `import type`. Thứ tự: thư viện ngoài (`node:` trước) → `@antadmin/*` → đường dẫn tương đối.
  - Package thư viện import tường minh từ `vue`/`nuxt/app`/`h3`; layer và app dùng auto-import.

**Đặt tên**
- Kiểu tên:
  - camelCase cho biến/hàm; `UPPER_SNAKE` cho hằng module (regex thêm hậu tố `_RE`).
  - Type viết PascalCase, không tiền tố `I*`. `interface` cho object, `type` cho union/function. Tên dạng
    `<Tên>Options`/`<Tên>Result`.
  - Dùng union chuỗi thay enum; class chỉ dành cho Error.
- Tiền tố hàm:
  - `use` composable · `create` factory · `define` giữ literal type
  - `is/has` kiểm tra · `to` chuyển đổi · `fetch` gọi HTTP · `load` nạp dữ liệu
  - `map` đổi dữ liệu ngoài → nội bộ · `parse/sanitize` xử lý input · `format` tạo chuỗi hiển thị · `merge` gộp
  - `*Of` truy xuất thuộc tính · `on*` handler · `_reset*` chỉ dùng cho test
- Thương hiệu: `AntAdmin` trong tên biến/hàm; `antadmin` trong chuỗi (`antadmin:<khu>:<tên>`, `$antadmin<Tên>`, `--antadmin-*`).
- File:
  - `C<Pascal>.vue`, `use<Pascal>.ts`; tên nhiều từ dùng kebab-case.
  - Plugin `NN.<tên>.ts`, middleware `<tên>.global.ts`, route `<tên>.<method>.ts`.
  - Test và story đặt cạnh file nguồn.
- Vue: prop đặt tên `show*`/`*Text`/`default*`, v-model qua `update:<prop>`, emit là động từ viết thường. CSS theo BEM
  `c-<tên>__phần--biến-thể` (trong layer: `antadmin-<tên>`).
- Dữ liệu: DTO dùng camelCase. Dữ liệu từ ngoài (snake_case của OAuth/OpenAI) giữ trong type riêng và map sang ở BFF.
  Env đặt dạng `NUXT_<SECTION>_<KEY>`.

**Lỗi & log**
- Client: mọi lỗi quy về `AppError` qua `toAppError()`. Mã HTTP nằm ở field **`status`** (không phải `statusCode`).
  Phân loại bằng `isAuthError/isForbidden/isValidation/isServerError/isNetworkError`.
- Hiển thị lỗi qua `useErrorHandler().handleError()`: 401 → về trang login, 422 không bật toast, 5xx/mất mạng → notification,
  còn lại → message. Caller muốn tự xử lý thì gọi `$antadminError(e)`.
- Composable: bật `loading` → gán `error.value = toAppError(e)` → tắt `loading` trong `finally`. Không để promise bị reject
  mà không có ai bắt. Hàm parse trả `null`; hàm validate trả `{ ok, payload | reason }`.
- Server: `throw createError({ statusCode, statusMessage: '<tiếng Việt>' })`.
  - 400 input sai · 401 xác thực/IAM từ chối (`code !== 'API000'`) · 403 không đủ quyền · 500 thiếu cấu hình (nêu tên env)
    · 502 lỗi upstream.
  - `$fetch` gọi ra ngoài luôn có `timeout` (10s).
- Lỗi do dùng sai API: `new Error('[@antadmin/<pkg>] … <cách sửa>')`. Không dùng `console.log` ở runtime; server chỉ dùng
  `console.warn/error`, có tiền tố tên package.

**API & DTO**
- Route BFF trả object có key đặt tên (`{ user: AuthUser | null }`). Không có dữ liệu thì trả `null`, không trả 404.
- Danh sách: `Paginated<T> = { items, total }`; query `TableQuery { page (tính từ 1), pageSize, sortField?, sortOrder?, filters? }`.
- 422: field errors nằm ở **gốc body** `{ message, errors: { field: string[] } }`. Không dùng `createError({ data })`,
  vì dữ liệu bị lồng vào `data` và `getFieldErrors` không đọc được.
- `/api/**` proxy nguyên trạng. Backend lệch format thì chuyển đổi trong fetcher. Không trả envelope IAM/OIDC thẳng cho client.
- DTO là `interface` trong `types.ts`: field tuỳ chọn dùng `?:`, "không có" dùng `T | null`, input chưa tin cậy nhận
  `unknown` rồi kiểm tra bằng type guard, forward đi đâu thì chỉ giữ các field được phép.

**Patterns**
- Composable-first: `use*` trả object phẳng. Không dùng class service/repository hay Pinia; fetcher gọi qua `useApi` đóng
  vai "repository".
- Lõi thuần (không phụ thuộc Nuxt/Vue/h3) + lớp adapter I/O mỏng; test lõi thuần trực tiếp.
- Dependency injection không cần container:
  - Plugin `provide` + `useNuxtApp()`; interface làm strategy (`AuthProvider`).
  - Truyền fetcher/callback vào (`useTable(fetcher)`, `useErrorHandler({ onAuthError })`).
  - Cấu hình qua `runtimeConfig`/`app.config.ts`. Options là tham số cuối, mặc định `= {}`.
- Factory đặt tên `create*`/`define*`; tách code client/server bằng subpath export.

## Quy trình thay đổi

- Test Vitest đặt cạnh file, tên dạng `it('<hành vi> → <kết quả>')`. Mock Nuxt bằng `vi.hoisted` + `vi.mock('nuxt/app')`;
  stub antdv bằng `vi.mock` đặt trước import.
- Component `C*` mới làm theo skill `new-component`:
  - `defineOptions({ name })`, `withDefaults(defineProps<…>())`.
  - Có story + test.
  - Đăng ký đủ ở `index.ts`, `install.ts` và `antadmin.d.ts`.
- AI tạo changeset thì viết thẳng file `.changeset/<slug>.md`, không chạy lệnh interactive `pnpm changeset`.
- Commit theo Conventional Commits bằng tiếng Việt (`feat(ui): …`); tên nhánh `feat|fix|docs/<scope>`.

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

## Nợ kỹ thuật đã biết (2026-09-13) — không bắt chước, sửa xong thì xoá dòng

- `useAiChat` gọi `toAppError({ statusCode })` nên mất status và message. `useTable` gọi `void load()` nên bị unhandled
  rejection khi fetch lỗi.
- `statusMessage` tiếng Việt khiến h3 cảnh báo và `toJSON()` làm mất dấu. Giữ nguyên tới khi quyết định đổi sang `message`;
  nếu đổi thì sửa luôn `AntAdminLoginForm.errorMessage()`.
- Còn sót code OIDC (không có route `/auth/callback`). Template CLI dùng `(record as any)`. Docs và mock vẫn dùng permission
  dạng `order.read`.
- GitHub chưa có workflow chạy trên PR; quality gate theo nhánh đang nằm ở `.gitlab-ci.yml`.
