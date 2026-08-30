import { describe, expect, it } from 'vitest'
import { searchDocs } from './docs'
import type { DocEntry } from './types'

const DOCS: DocEntry[] = [
  { title: 'Đăng nhập IAM', path: 'docs/guide/auth.md', content: 'Form login qua endpoint IAM AntAdmin. userInfo gọi POST không kèm Bearer.' },
  { title: 'Theming', path: 'docs/guide/theming.md', content: 'Dùng CSS vars --antadmin-* để bám theme. Dark mode runtime.' },
  { title: 'Kiến trúc', path: 'docs/guide/architecture.md', content: 'SSR với antd-vue kém nên hybrid rendering CSR mặc định.' },
]

describe('searchDocs', () => {
  it('khớp từ khoá trong content', () => {
    const hits = searchDocs(DOCS, 'IAM Bearer')
    expect(hits[0]!.path).toBe('docs/guide/auth.md')
    expect(hits[0]!.excerpt).toContain('IAM')
  })

  it('title được nhân điểm cao hơn', () => {
    const hits = searchDocs(DOCS, 'theming')
    expect(hits[0]!.title).toBe('Theming')
  })

  it('rỗng khi không khớp', () => {
    expect(searchDocs(DOCS, 'kubernetes')).toEqual([])
  })

  it('query rỗng → rỗng', () => {
    expect(searchDocs(DOCS, '   ')).toEqual([])
  })

  it('tôn trọng limit', () => {
    expect(searchDocs(DOCS, 'antadmin', 1)).toHaveLength(1)
  })
})
