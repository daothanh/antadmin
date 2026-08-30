import { describe, expect, it } from 'vitest'
import { checkAssertion } from './assertions'

describe('checkAssertion', () => {
  it('contains + ignoreCase', () => {
    expect(checkAssertion('Xin Chào', { type: 'contains', value: 'xin chào', ignoreCase: true }).pass).toBe(true)
    expect(checkAssertion('Xin Chào', { type: 'contains', value: 'xin chào' }).pass).toBe(false)
  })

  it('not-contains', () => {
    expect(checkAssertion('ok', { type: 'not-contains', value: 'system prompt' }).pass).toBe(true)
    expect(checkAssertion('my System Prompt', { type: 'not-contains', value: 'system prompt', ignoreCase: true }).pass).toBe(false)
  })

  it('regex với flags', () => {
    expect(checkAssertion('Có dấu tiếng Việt', { type: 'regex', pattern: '[àạể]', flags: 'i' }).pass).toBe(false)
    expect(checkAssertion('Có dấu', { type: 'regex', pattern: '[áấu]' }).pass).toBe(true)
  })

  it('max-chars kèm số thực tế trong detail', () => {
    const r = checkAssertion('12345', { type: 'max-chars', value: 3 })
    expect(r.pass).toBe(false)
    expect(r.detail).toContain('thực tế 5')
  })

  it('max-lines bỏ dòng trống', () => {
    expect(checkAssertion('a\n\nb\nc\n', { type: 'max-lines', value: 3 }).pass).toBe(true)
    expect(checkAssertion('a\nb\nc\nd', { type: 'max-lines', value: 3 }).pass).toBe(false)
  })

  it('json-valid: JSON thuần và bọc fence đều pass, rác thì fail', () => {
    expect(checkAssertion('{"a":1}', { type: 'json-valid' }).pass).toBe(true)
    expect(checkAssertion('```json\n{"a":1}\n```', { type: 'json-valid' }).pass).toBe(true)
    expect(checkAssertion('chịu thôi', { type: 'json-valid' }).pass).toBe(false)
  })
})
