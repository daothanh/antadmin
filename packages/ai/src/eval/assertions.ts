// Assertion kiểm tra output model — thuần và tất định (không dùng LLM chấm LLM
// ở giai đoạn này để eval CI rẻ, nhanh, không flaky).

export type Assertion =
  | { type: 'contains'; value: string; ignoreCase?: boolean }
  | { type: 'not-contains'; value: string; ignoreCase?: boolean }
  | { type: 'regex'; pattern: string; flags?: string }
  | { type: 'max-chars'; value: number }
  | { type: 'json-valid' }
  | { type: 'max-lines'; value: number }

export interface AssertionResult {
  pass: boolean
  /** Mô tả ngắn để in report khi fail. */
  detail: string
}

export function checkAssertion(output: string, a: Assertion): AssertionResult {
  switch (a.type) {
    case 'contains': {
      const [haystack, needle] = a.ignoreCase
        ? [output.toLowerCase(), a.value.toLowerCase()]
        : [output, a.value]
      return { pass: haystack.includes(needle), detail: `contains "${a.value}"` }
    }
    case 'not-contains': {
      const [haystack, needle] = a.ignoreCase
        ? [output.toLowerCase(), a.value.toLowerCase()]
        : [output, a.value]
      return { pass: !haystack.includes(needle), detail: `not-contains "${a.value}"` }
    }
    case 'regex':
      return {
        pass: new RegExp(a.pattern, a.flags).test(output),
        detail: `regex /${a.pattern}/${a.flags ?? ''}`,
      }
    case 'max-chars':
      return {
        pass: output.length <= a.value,
        detail: `max-chars ${a.value} (thực tế ${output.length})`,
      }
    case 'max-lines': {
      const lines = output.trim().split('\n').filter((l) => l.trim()).length
      return { pass: lines <= a.value, detail: `max-lines ${a.value} (thực tế ${lines})` }
    }
    case 'json-valid': {
      // Model hay bọc ```json — bóc fence trước khi parse (chấp nhận được).
      const raw = output.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim()
      try {
        JSON.parse(raw)
        return { pass: true, detail: 'json-valid' }
      } catch {
        return { pass: false, detail: 'json-valid (parse thất bại)' }
      }
    }
  }
}
