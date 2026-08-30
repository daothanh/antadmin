# AI trong sản phẩm — @antadmin/ai

`@antadmin/ai` là nền tảng để app sản phẩm thêm tính năng AI (chat, tóm tắt, trích xuất…) theo đúng
kiến trúc framework: **client không bao giờ giữ API key**, mọi request đi qua BFF.

```
Browser ──POST /api/ai/chat──▶ Nitro BFF (createAiChatProxy) ──Bearer key──▶ AI Gateway (OpenAI-compatible)
```

Gateway nội bộ (LiteLLM) do team hạ tầng vận hành — app chỉ cần 2 biến env.

## Cài đặt

```bash
pnpm add @antadmin/ai
```

`nuxt.config.ts` của app (giống `@antadmin/ui`/`@antadmin/composables` trong layer):

```ts
build: { transpile: ['@antadmin/ai'] }
```

`.env` (key do team hạ tầng cấp **theo app** — không dùng chung, không commit):

```bash
AI_GATEWAY_URL=https://ai.antadmin.vn/v1
AI_GATEWAY_KEY=sk-...
```

## Server — mount proxy

Tạo `server/api/ai/chat.post.ts`:

```ts
import { createAiChatProxy } from '@antadmin/ai/server'

export default createAiChatProxy({
  gatewayUrl: process.env.AI_GATEWAY_URL!,
  apiKey: process.env.AI_GATEWAY_KEY!,
  defaultModel: 'claude-sonnet-5',
  allowedModels: ['claude-sonnet-5', 'claude-haiku-4-5'],
})
```

| Option | Mặc định | Ý nghĩa |
|---|---|---|
| `gatewayUrl` / `apiKey` | — (bắt buộc) | Endpoint + key gateway, chỉ tồn tại server-side |
| `defaultModel` | — | Model khi client không gửi |
| `allowedModels` | cho tất cả | Allowlist model |
| `maxMessages` | `50` | Số message tối đa mỗi request |
| `maxTotalChars` | `100_000` | Tổng ký tự tối đa |
| `authorize` | không check | Hook `(event) => boolean` — trả `false` → 401 |

Bảo vệ có sẵn: body bị **whitelist** (chỉ `model`/`messages`/`temperature`/`max_tokens` đi qua,
message chỉ giữ `role` + `content`); lỗi key gateway (401/403) trả về client dạng **502 chung
chung** — không lộ chi tiết cấu hình.

## Client — useAiChat

```vue
<script setup lang="ts">
import { useAiChat } from '@antadmin/ai'
import { antadminAssistant, renderPrompt } from '@antadmin/ai/prompts'

const { messages, status, error, send, abort, reset } = useAiChat({
  system: renderPrompt(antadminAssistant, { app_name: 'Thu phí ETC' }),
})
</script>
```

| Trả về | Ý nghĩa |
|---|---|
| `messages` | `Ref<ChatMessage[]>` — cập nhật dần theo stream SSE, render trực tiếp |
| `status` | `idle` / `streaming` / `error` — disable input khi `streaming` |
| `error` | `AppError` khi lỗi thật (placeholder rỗng tự gỡ, message user giữ lại để gửi lại) |
| `send(text)` | Gửi — tự chặn khi đang streaming, bỏ qua input rỗng |
| `abort()` | Dừng stream, **giữ** phần đã nhận |
| `reset()` | Xoá hội thoại về trạng thái đầu |

Chỉ dùng client-side (page framework mặc định CSR — xem [Kiến trúc](/guide/architecture)).

## UI — CChat + CChatMessage

`@antadmin/ui` có sẵn component chat theo theme AntAdmin, nối thẳng với `useAiChat`:

```vue
<template>
  <CChat
    :messages="messages"
    :status="status"
    :error="error?.message"
    title="Trợ lý AntAdmin"
    @send="send"
    @stop="abort"
    @clear="reset"
  />
</template>
```

- `CChat`: khung hội thoại + ô nhập (Enter gửi, Shift+Enter xuống dòng, không cắt ngang IME
  tiếng Việt), nút Gửi ↔ Dừng theo `status`, prop `disabled` để khoá (chưa đăng nhập/hết quota).
- `CChatMessage`: bong bóng theo `role`, `pending` hiện chấm gõ khi chờ token đầu.
- Chi tiết props: xem [Storybook](https://web.docs.vtii.vn/storybook/).

## Prompt library — @antadmin/ai/prompts

Prompt dùng chung có **version**, template `{{biến}}` validate 2 chiều (thiếu biến khai báo hoặc
placeholder không được cấp → ném lỗi ngay lúc dev):

```ts
import { definePrompt, renderPrompt } from '@antadmin/ai/prompts'

const myPrompt = definePrompt({
  id: 'orders-triage',
  version: 1,
  description: 'Phân loại yêu cầu hỗ trợ đơn hàng',
  template: 'Bạn hỗ trợ app {{app_name}}...',
  variables: ['app_name'],
})
const system = renderPrompt(myPrompt, { app_name: 'Thu phí ETC' })
```

Có sẵn: `antadminAssistant` (persona trợ lý chuẩn — tiếng Việt, không bịa số liệu),
`summarize`, `extractJson`. **Quy tắc:** đổi nội dung template → tăng `version` + thêm eval case.

## Eval — @antadmin/ai/eval

Golden cases ở `packages/ai/evals/cases.ts`, assertion **tất định** (contains / regex /
json-valid / max-lines… — không dùng LLM chấm LLM):

```bash
AI_GATEWAY_URL=... AI_GATEWAY_KEY=... pnpm --filter @antadmin/ai eval
```

CI: job `ai-eval` tự chạy khi MR đụng `packages/ai/**` và khi merge vào `main`
(`allow_failure` — gateway sập không khoá MR). Cần biến CI/CD `AI_GATEWAY_URL` /
`AI_GATEWAY_KEY`, tuỳ chọn `AI_EVAL_MODEL`.
