import { formatReport, runEvalSuite, summarize } from '../src/eval'
import { cases } from '../evals/cases'

// Chạy eval suite qua AI gateway thật — dùng trong CI (job ai-eval) hoặc local:
//   AI_GATEWAY_URL=... AI_GATEWAY_KEY=... pnpm --filter @antadmin/ai eval
// Exit ≠ 0 khi có case fail để CI đánh dấu (job đặt allow_failure).

const gatewayUrl = process.env.AI_GATEWAY_URL
const apiKey = process.env.AI_GATEWAY_KEY
const model = process.env.AI_EVAL_MODEL ?? 'claude-haiku-4-5'

if (!gatewayUrl || !apiKey) {
  console.error('[ai-eval] thiếu AI_GATEWAY_URL / AI_GATEWAY_KEY — bỏ qua (gateway chưa cấu hình).')
  process.exit(0) // thiếu env = chưa bật eval, không phải fail
}

const results = await runEvalSuite(cases, { gatewayUrl, apiKey, model })
console.log(formatReport(results))

const s = summarize(results)
process.exit(s.failed > 0 ? 1 : 0)
