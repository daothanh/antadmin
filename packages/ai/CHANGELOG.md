# @antadmin/ai

## 1.3.1

### Patch Changes

- 06d0133: Phát hành lại artifact npm `1.3.1` được đóng gói qua pnpm (rewrite `workspace:*` thành version semver cụ
  thể lúc pack), sửa lỗi `1.3.0` khiến consumer cài ngoài monorepo thất bại vì dependency runtime vẫn mang
  `workspace:*`. Nguồn trong repo giữ `workspace:*` để luôn link source local khi phát triển.
- @antadmin/utils@1.3.1

## 1.3.0

### Minor Changes

- Nền tảng AI dùng chung: `useAiChat` streaming SSE, `createAiChatProxy` cho Nitro BFF và
  kiểm soát request server-side.
- Prompt library (`@antadmin/ai/prompts`) gồm `definePrompt`/`renderPrompt` và các prompt chuẩn.
- Eval harness (`@antadmin/ai/eval`) với assertion tất định, golden case và report cho gateway
  OpenAI-compatible.
