---
"@antadmin/ai": minor
---

Package mới `@antadmin/ai` — nền tảng AI dùng chung (Giai đoạn 2 lộ trình AI tooling):

- `useAiChat` (client): chat streaming SSE qua BFF, state messages/status/error, abort/reset.
- `createAiChatProxy` (`@antadmin/ai/server`): Nitro handler proxy tới AI gateway OpenAI-compatible;
  whitelist body, allowlist model, giới hạn payload, key chỉ tồn tại server-side.
- Parser SSE + `sanitizeChatRequest` tách rời, test đầy đủ (coverage gate 90%).
