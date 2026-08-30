---
"@antadmin/ai": minor
---

Thêm prompt library (@antadmin/ai/prompts: definePrompt/renderPrompt validate biến, bộ prompt chuẩn antadminAssistant/summarize/extractJson có version) và eval harness (@antadmin/ai/eval: assertion tất định contains/regex/json-valid/max-lines, runner gọi gateway OpenAI-compatible, report). Golden cases ở evals/cases.ts, chạy bằng `pnpm --filter @antadmin/ai eval`; CI thêm job ai-eval chạy khi MR đụng packages/ai/** (allow_failure, cần AI_GATEWAY_URL/AI_GATEWAY_KEY).
