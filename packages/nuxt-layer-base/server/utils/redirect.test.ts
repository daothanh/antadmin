import { describe, expect, it } from 'vitest'
import { sanitizeRedirect } from './redirect'

describe('sanitizeRedirect', () => {
  it('giữ đường dẫn nội bộ hợp lệ', () => {
    expect(sanitizeRedirect('/orders')).toBe('/orders')
    expect(sanitizeRedirect('/a/b?x=1#h')).toBe('/a/b?x=1#h')
  })

  it('chặn URL tuyệt đối (open redirect)', () => {
    expect(sanitizeRedirect('https://evil.com')).toBe('/')
    expect(sanitizeRedirect('http://evil.com/path')).toBe('/')
  })

  it('chặn protocol-relative //host và backslash //', () => {
    expect(sanitizeRedirect('//evil.com')).toBe('/')
    expect(sanitizeRedirect('/\\evil.com')).toBe('/')
  })

  it('chặn giá trị rỗng / không phải chuỗi', () => {
    expect(sanitizeRedirect('')).toBe('/')
    expect(sanitizeRedirect(undefined)).toBe('/')
    expect(sanitizeRedirect(null)).toBe('/')
    expect(sanitizeRedirect(['/x'])).toBe('/')
  })

  it('dùng fallback tuỳ biến', () => {
    expect(sanitizeRedirect('https://evil.com', '/home')).toBe('/home')
  })
})
