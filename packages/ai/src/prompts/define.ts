// Lõi prompt library: định nghĩa prompt có version + render template an toàn.
// Template dùng placeholder {{tên_biến}}; render validate cả biến thiếu lẫn
// placeholder thừa (bắt lỗi gõ nhầm ngay lúc dev thay vì gửi prompt hỏng đi).

export interface PromptDef<V extends string = string> {
  /** Định danh duy nhất, kebab-case — dùng trong eval case và log. */
  id: string
  /** Tăng khi đổi nội dung template — eval CI so sánh chất lượng giữa version. */
  version: number
  description: string
  /** Template với placeholder {{tên_biến}}. */
  template: string
  /** Biến bắt buộc phải truyền khi render. */
  variables?: readonly V[]
}

/** Helper giữ literal type cho tên biến (autocomplete khi render). */
export function definePrompt<const V extends string>(def: PromptDef<V>): PromptDef<V> {
  return def
}

const PLACEHOLDER_RE = /\{\{\s*([\w-]+)\s*\}\}/g

/** Liệt kê tên placeholder xuất hiện trong template (không trùng lặp). */
export function listPlaceholders(template: string): string[] {
  const names = new Set<string>()
  for (const m of template.matchAll(PLACEHOLDER_RE)) names.add(m[1]!)
  return [...names]
}

/**
 * Render prompt với biến — ném lỗi khi thiếu biến khai báo hoặc template còn
 * placeholder không được cấp giá trị (typo guard).
 */
export function renderPrompt<V extends string>(
  def: PromptDef<V>,
  vars: Record<V, string> = {} as Record<V, string>,
): string {
  const missing = (def.variables ?? []).filter((v) => vars[v] === undefined)
  if (missing.length) {
    throw new Error(`[@antadmin/ai] prompt "${def.id}" thiếu biến: ${missing.join(', ')}`)
  }

  const unknown: string[] = []
  const out = def.template.replace(PLACEHOLDER_RE, (_, name: string) => {
    const value = (vars as Record<string, string>)[name]
    if (value === undefined) {
      unknown.push(name)
      return ''
    }
    return value
  })
  if (unknown.length) {
    throw new Error(
      `[@antadmin/ai] prompt "${def.id}" có placeholder không được cấp giá trị: ${unknown.join(', ')}`,
    )
  }
  return out
}
