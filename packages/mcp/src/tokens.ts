import type { TokenSet } from './types'

/**
 * Định dạng bảng token dạng text cho AI đọc: mỗi dòng `--antadmin-x: light / dark`.
 * `filter` (nếu có) lọc theo tên chứa chuỗi con (không phân biệt hoa thường).
 */
export function formatTokens(tokens: TokenSet, filter?: string): string {
  const names = Object.keys(tokens.light)
  const f = filter?.toLowerCase()
  const rows = names
    .filter((n) => !f || n.toLowerCase().includes(f))
    .map((n) => {
      const light = tokens.light[n] ?? ''
      const dark = tokens.dark[n] ?? light
      return dark === light ? `${n}: ${light}` : `${n}: ${light}  (dark: ${dark})`
    })

  if (!rows.length) return filter ? `Không có token khớp "${filter}".` : 'Không có token.'
  return rows.join('\n')
}
