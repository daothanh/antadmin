import type { ChatMessage } from '../types'
import { checkAssertion, type Assertion, type AssertionResult } from './assertions'

// Chạy eval case qua gateway OpenAI-compatible (non-stream). Chạy TUẦN TỰ để
// bound chi phí và không dội rate-limit gateway — tập eval nhỏ, chậm chút không sao.

export interface EvalCase {
  /** Định danh case, nên tiền tố theo prompt id: "extract-json/don-hang". */
  id: string
  messages: ChatMessage[]
  assertions: Assertion[]
}

export interface EvalRunOptions {
  gatewayUrl: string
  apiKey: string
  model: string
  /** Nhiệt độ thấp mặc định (0) để output ổn định giữa các lần chạy CI. */
  temperature?: number
  /** fetch tuỳ biến (phục vụ test). Mặc định globalThis.fetch. */
  fetch?: typeof globalThis.fetch
}

export interface EvalCaseResult {
  id: string
  pass: boolean
  /** Kết quả từng assertion (cùng thứ tự với case.assertions). */
  assertions: AssertionResult[]
  /** Output model (cắt gọn khi in report). */
  output: string
  /** Lỗi hạ tầng (gateway chết, timeout…) — khác với assertion fail. */
  error?: string
}

/** Gọi gateway 1 lượt, trả content assistant (ném lỗi khi HTTP/shape sai). */
export async function callGateway(
  messages: ChatMessage[],
  options: EvalRunOptions,
): Promise<string> {
  const doFetch = options.fetch ?? globalThis.fetch
  const base = options.gatewayUrl.replace(/\/$/, '')
  const res = await doFetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0,
      stream: false,
    }),
  })
  if (!res.ok) throw new Error(`gateway trả ${res.status}`)
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== 'string') throw new Error('response thiếu choices[0].message.content')
  return content
}

export async function runEvalCase(c: EvalCase, options: EvalRunOptions): Promise<EvalCaseResult> {
  try {
    const output = await callGateway(c.messages, options)
    const results = c.assertions.map((a) => checkAssertion(output, a))
    return { id: c.id, pass: results.every((r) => r.pass), assertions: results, output }
  } catch (err) {
    return {
      id: c.id,
      pass: false,
      assertions: [],
      output: '',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function runEvalSuite(
  cases: EvalCase[],
  options: EvalRunOptions,
): Promise<EvalCaseResult[]> {
  const results: EvalCaseResult[] = []
  for (const c of cases) results.push(await runEvalCase(c, options))
  return results
}
