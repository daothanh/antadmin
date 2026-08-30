import { describe, expect, it } from 'vitest'
import { formatTokens } from './tokens'
import type { TokenSet } from './types'

const TOKENS: TokenSet = {
  light: { '--antadmin-color-primary': '#123', '--antadmin-color-text': '#000' },
  dark: { '--antadmin-color-primary': '#123', '--antadmin-color-text': '#fff' },
}

describe('formatTokens', () => {
  it('hiện dark khi khác light', () => {
    const out = formatTokens(TOKENS)
    expect(out).toContain('--antadmin-color-primary: #123')
    expect(out).toContain('--antadmin-color-text: #000  (dark: #fff)')
  })

  it('filter theo tên', () => {
    const out = formatTokens(TOKENS, 'primary')
    expect(out).toContain('primary')
    expect(out).not.toContain('color-text')
  })

  it('thông báo khi filter không khớp', () => {
    expect(formatTokens(TOKENS, 'xyz')).toContain('Không có token khớp')
  })
})
