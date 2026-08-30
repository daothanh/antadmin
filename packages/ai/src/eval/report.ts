import type { EvalCaseResult } from './runner'

// Định dạng kết quả eval thành text/markdown cho log CI và comment MR.

export interface EvalSummary {
  total: number
  passed: number
  failed: number
}

export function summarize(results: EvalCaseResult[]): EvalSummary {
  const passed = results.filter((r) => r.pass).length
  return { total: results.length, passed, failed: results.length - passed }
}

const OUTPUT_PREVIEW = 200

export function formatReport(results: EvalCaseResult[]): string {
  const s = summarize(results)
  const lines: string[] = [`# AI Eval: ${s.passed}/${s.total} pass`]

  for (const r of results) {
    lines.push('', `## ${r.pass ? '✅' : '❌'} ${r.id}`)
    if (r.error) {
      lines.push(`Lỗi hạ tầng: ${r.error}`)
      continue
    }
    for (const a of r.assertions) {
      lines.push(`- ${a.pass ? 'pass' : 'FAIL'}: ${a.detail}`)
    }
    if (!r.pass) {
      const preview = r.output.length > OUTPUT_PREVIEW
        ? `${r.output.slice(0, OUTPUT_PREVIEW)}…`
        : r.output
      lines.push('', '```', preview, '```')
    }
  }
  return lines.join('\n')
}
