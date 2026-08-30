# @antadmin/ai

## 1.4.0

### Minor Changes

- a28f45c: Package mới `@antadmin/ai` — nền tảng AI dùng chung (Giai đoạn 2 lộ trình AI tooling):
  
  - `useAiChat` (client): chat streaming SSE qua BFF, state messages/status/error, abort/reset.
  - `createAiChatProxy` (`@antadmin/ai/server`): Nitro handler proxy tới AI gateway OpenAI-compatible;
    whitelist body, allowlist model, giới hạn payload, key chỉ tồn tại server-side.
  - Parser SSE + `sanitizeChatRequest` tách rời, test đầy đủ (coverage gate 90%).
- a28f45c: Thêm prompt library (@antadmin/ai/prompts: definePrompt/renderPrompt validate biến, bộ prompt chuẩn antadminAssistant/summarize/extractJson có version) và eval harness (@antadmin/ai/eval: assertion tất định contains/regex/json-valid/max-lines, runner gọi gateway OpenAI-compatible, report). Golden cases ở evals/cases.ts, chạy bằng `pnpm --filter @antadmin/ai eval`; CI thêm job ai-eval chạy khi MR đụng packages/ai/** (allow_failure, cần AI_GATEWAY_URL/AI_GATEWAY_KEY).

### Patch Changes

- ae96b1a: Phát hành công khai toàn bộ package AntAdmin lên npmjs.com bằng trusted publishing của GitHub Actions.
- Updated dependencies [ae96b1a]
  - @antadmin/utils@1.4.0
