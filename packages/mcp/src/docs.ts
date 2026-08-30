import type { DocEntry } from './types'

export interface DocHit {
  path: string
  title: string
  excerpt: string
  score: number
}

const TERM_RE = /[a-zA-ZÀ-ỹ0-9_/-]+/g

function terms(q: string): string[] {
  return (q.toLowerCase().match(TERM_RE) ?? []).filter((t) => t.length > 1)
}

/** Excerpt quanh vị trí khớp đầu tiên (mặc định ±90 ký tự). */
function excerptAround(content: string, needle: string, pad = 90): string {
  const at = content.toLowerCase().indexOf(needle)
  if (at < 0) return content.slice(0, pad * 2).trim()
  const start = Math.max(0, at - pad)
  const end = Math.min(content.length, at + needle.length + pad)
  return `${start > 0 ? '…' : ''}${content.slice(start, end).trim()}${end < content.length ? '…' : ''}`
}

/**
 * Tìm tài liệu theo từ khoá — chấm điểm theo số lần khớp (title nhân 3). Thuần
 * in-memory trên tập DocEntry đã bundle; đủ nhẹ cho vài chục trang docs.
 */
export function searchDocs(entries: DocEntry[], query: string, limit = 5): DocHit[] {
  const ts = terms(query)
  if (!ts.length) return []

  const hits: DocHit[] = []
  for (const e of entries) {
    const title = e.title.toLowerCase()
    const content = e.content.toLowerCase()
    let score = 0
    for (const t of ts) {
      score += content.split(t).length - 1
      if (title.includes(t)) score += 3
    }
    if (score > 0) {
      hits.push({ path: e.path, title: e.title, excerpt: excerptAround(e.content, ts[0]!), score })
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}
