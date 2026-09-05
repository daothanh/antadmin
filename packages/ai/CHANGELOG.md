# @antadmin/ai

## 1.3.0

### Minor Changes

- Nền tảng AI dùng chung: `useAiChat` streaming SSE, `createAiChatProxy` cho Nitro BFF và
  kiểm soát request server-side.
- Prompt library (`@antadmin/ai/prompts`) gồm `definePrompt`/`renderPrompt` và các prompt chuẩn.
- Eval harness (`@antadmin/ai/eval`) với assertion tất định, golden case và report cho gateway
  OpenAI-compatible.
