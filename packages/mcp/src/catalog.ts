import type { ComponentMeta, PropInfo } from './types'

// Trích metadata component C* từ nguồn SFC. Bám phong cách nhất quán của
// @antadmin/ui (script setup + defineOptions + withDefaults(defineProps<{...}>()))
// nên dùng quét cân bằng dấu ngoặc thay vì AST đầy đủ — đủ chính xác, không kéo
// thêm dependency compiler.

const OPEN: Record<string, string> = { '(': ')', '[': ']', '{': '}', '<': '>' }
const CLOSE = new Set([')', ']', '}', '>'])

/** Trả về chỉ số ký tự đóng khớp với ký tự mở tại `openIdx`, hoặc -1. */
export function matchBalanced(src: string, openIdx: number): number {
  const stack: string[] = []
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i]!
    if (OPEN[ch]) stack.push(OPEN[ch])
    else if (CLOSE.has(ch)) {
      if (stack.pop() !== ch) return -1
      if (stack.length === 0) return i
    }
  }
  return -1
}

/** Lấy nội dung object `{...}` đầu tiên sau `marker` (không gồm cặp ngoặc). */
function innerObjectAfter(src: string, marker: string): string | null {
  const at = src.indexOf(marker)
  if (at < 0) return null
  const open = src.indexOf('{', at + marker.length)
  if (open < 0) return null
  const close = matchBalanced(src, open)
  if (close < 0) return null
  return src.slice(open + 1, close)
}

function isBalanced(s: string): boolean {
  return matchBalancedFull(s)
}
function matchBalancedFull(s: string): boolean {
  const stack: string[] = []
  for (const ch of s) {
    if (OPEN[ch]) stack.push(OPEN[ch])
    else if (CLOSE.has(ch)) {
      if (stack.pop() !== ch) return false
    }
  }
  return stack.length === 0
}

function stripComment(line: string): string {
  return line
    .replace(/^\/\*\*?/, '')
    .replace(/\*\/$/, '')
    .replace(/^\/\//, '')
    .replace(/^\*/, '')
    .trim()
}

/** Parse thân `{...}` của defineProps generic thành danh sách prop. */
export function parseProps(body: string): PropInfo[] {
  const props: PropInfo[] = []
  let comment = ''
  let buffer = ''
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line) {
      if (!buffer) comment = ''
      continue
    }
    if (!buffer && (line.startsWith('/*') || line.startsWith('//') || line.startsWith('*'))) {
      const c = stripComment(line)
      comment = comment ? `${comment} ${c}` : c
      continue
    }
    buffer = buffer ? `${buffer} ${line}` : line
    if (!isBalanced(buffer)) continue
    const m = buffer.match(/^(\w+)(\?)?\s*:\s*(.+?)[;,]?$/s)
    if (m) {
      props.push({
        name: m[1]!,
        optional: Boolean(m[2]),
        type: m[3]!.trim(),
        description: comment || undefined,
      })
    }
    buffer = ''
    comment = ''
  }
  return props
}

/** Parse object defaults của withDefaults thành map name→giá trị thô. */
export function parseDefaults(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  let buffer = ''
  for (const raw of body.split('\n')) {
    const line = raw.trim().replace(/,$/, '')
    if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue
    buffer = buffer ? `${buffer} ${line}` : line
    if (!isBalanced(buffer)) continue
    const m = buffer.match(/^(\w+)\s*:\s*(.+)$/s)
    if (m) out[m[1]!] = m[2]!.trim()
    buffer = ''
  }
  return out
}

/** Tên các event trong defineEmits<{...}>() (chỉ lấy tên, bỏ payload). */
export function parseEmits(body: string): string[] {
  const names: string[] = []
  for (const raw of body.split('\n')) {
    const m = raw.trim().match(/^(\w+)\s*:/)
    if (m) names.push(m[1]!)
  }
  return names
}

/** Mô tả component = block comment `//` đầu tiên trong <script setup>. */
export function extractDescription(script: string): string {
  const lines: string[] = []
  for (const raw of script.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('//')) {
      lines.push(stripComment(line))
      continue
    }
    if (lines.length) break // đã bắt được block đầu, dừng ở dòng non-comment
    if (line.startsWith('import') || line === '' || line.startsWith('<')) continue
    if (line.startsWith('defineOptions') || line.startsWith('const') || line.startsWith('define')) break
  }
  return lines.join(' ').trim()
}

/**
 * Trích ComponentMeta từ nguồn SFC. Trả null nếu không phải component (không có
 * defineOptions name và không suy ra được từ fallbackName).
 */
export function extractComponentMeta(
  source: string,
  path: string,
  fallbackName?: string,
): ComponentMeta | null {
  const scriptMatch = source.match(/<script[^>]*setup[^>]*>([\s\S]*?)<\/script>/)
  const script = scriptMatch?.[1] ?? source

  const nameMatch = script.match(/defineOptions\(\s*\{[^}]*name:\s*['"]([^'"]+)['"]/)
  const name = nameMatch?.[1] ?? fallbackName
  if (!name) return null

  const propsBody = innerObjectAfter(script, 'defineProps<')
  const props = propsBody ? parseProps(propsBody) : []

  // Gắn defaults (nếu dùng withDefaults). Lấy object literal sau dấu `),`.
  const wd = script.indexOf('withDefaults')
  if (wd >= 0) {
    const braceAt = script.indexOf('{', script.indexOf('>()', wd))
    if (braceAt >= 0) {
      const close = matchBalanced(script, braceAt)
      if (close >= 0) {
        const defaults = parseDefaults(script.slice(braceAt + 1, close))
        for (const p of props) if (p.name in defaults) p.default = defaults[p.name]
      }
    }
  }

  const emitsBody = innerObjectAfter(script, 'defineEmits<')
  const emits = emitsBody ? parseEmits(emitsBody) : []

  return { name, description: extractDescription(script), props, emits, path }
}
