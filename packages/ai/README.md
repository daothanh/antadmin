# @antadmin/ai

Nền tảng AI dùng chung AntAdmin: composable chat streaming phía client + proxy Nitro tới AI gateway
phía server. **Client không bao giờ giữ API key** — key nằm ở BFF (server-side env), request đi:

```
Browser ──POST /api/ai/chat──▶ Nitro BFF (createAiChatProxy) ──Bearer key──▶ AI Gateway (OpenAI-compatible)
```

## Server — mount proxy trong app

Tạo `server/api/ai/chat.post.ts`:

```ts
import { createAiChatProxy } from '@antadmin/ai/server'

export default createAiChatProxy({
  gatewayUrl: process.env.AI_GATEWAY_URL!,   // vd https://ai.antadmin.vn/v1
  apiKey: process.env.AI_GATEWAY_KEY!,       // key app-level do gateway cấp
  defaultModel: 'claude-sonnet-5',
  allowedModels: ['claude-sonnet-5', 'claude-haiku-4-5'], // optional
})
```

Body từ client được **whitelist** (chỉ `model`/`messages`/`temperature`/`max_tokens` đi qua,
message chỉ giữ `role`+`content`), giới hạn 50 messages / 100k ký tự. Lỗi key gateway (401/403)
trả về client dạng 502 chung chung — không lộ chi tiết.

## Client — composable

```vue
<script setup lang="ts">
import { useAiChat } from '@antadmin/ai'

const { messages, status, error, send, abort, reset } = useAiChat({
  system: 'Bạn là trợ lý nội bộ AntAdmin, trả lời tiếng Việt.',
})
</script>
```

- `messages` cập nhật dần theo stream (SSE) — render trực tiếp trong template.
- `status`: `idle | streaming | error` — disable input khi `streaming`.
- `abort()` dừng stream giữ phần đã nhận; lỗi thật thì placeholder rỗng tự gỡ, message user
  giữ lại để gửi lần nữa.
- Chỉ dùng client-side (page framework mặc định CSR).

## Prompt library — `@antadmin/ai/prompts`

Prompt dùng chung có version, template `{{biến}}` với validate (thiếu biến / placeholder thừa
đều ném lỗi ngay lúc dev):

```ts
import { antadminAssistant, renderPrompt } from '@antadmin/ai/prompts'

const system = renderPrompt(antadminAssistant, { app_name: 'Thu phí ETC' })
const chat = useAiChat({ system })
```

Có sẵn: `antadminAssistant` (persona trợ lý chuẩn), `summarize` (tóm tắt N gạch đầu dòng),
`extractJson` (trích JSON theo schema). Prompt mới dùng `definePrompt` — đổi nội dung thì
**tăng `version`** và thêm eval case.

## Eval — `@antadmin/ai/eval` + CI

Golden cases ở `evals/cases.ts`, assertion **tất định** (contains/regex/json-valid/max-lines…,
không LLM chấm LLM). Chạy local:

```bash
AI_GATEWAY_URL=... AI_GATEWAY_KEY=... pnpm --filter @antadmin/ai eval
```

CI: job `ai-eval` chạy khi MR đụng `packages/ai/**` (cần biến `AI_GATEWAY_URL`/`AI_GATEWAY_KEY`,
tuỳ chọn `AI_EVAL_MODEL`), `allow_failure` — gateway sập không khoá MR.

## Lưu ý cho app Nuxt

Thêm vào `nuxt.config.ts` của app (như `@antadmin/ui`/`@antadmin/composables` trong layer):

```ts
build: { transpile: ['@antadmin/ai'] }
```
