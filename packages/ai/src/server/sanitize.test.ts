import { describe, expect, it } from 'vitest'
import { sanitizeChatRequest } from './sanitize'

const user = (content: string) => ({ role: 'user', content })

describe('sanitizeChatRequest', () => {
  it('body hợp lệ → payload whitelist + stream:true', () => {
    const r = sanitizeChatRequest(
      { model: 'claude-sonnet-5', messages: [user('hi')], extra: 'bị bỏ' },
      {},
    )
    expect(r).toEqual({
      ok: true,
      payload: { model: 'claude-sonnet-5', messages: [{ role: 'user', content: 'hi' }], stream: true },
    })
  })

  it('body không phải object → lỗi', () => {
    expect(sanitizeChatRequest(null).ok).toBe(false)
    expect(sanitizeChatRequest('x').ok).toBe(false)
  })

  it('thiếu/rỗng messages → lỗi', () => {
    expect(sanitizeChatRequest({}).ok).toBe(false)
    expect(sanitizeChatRequest({ messages: [] }).ok).toBe(false)
  })

  it('vượt maxMessages → lỗi', () => {
    const r = sanitizeChatRequest(
      { model: 'm', messages: [user('a'), user('b')] },
      { maxMessages: 1 },
    )
    expect(r.ok).toBe(false)
  })

  it('role lạ hoặc content không phải string → lỗi', () => {
    expect(sanitizeChatRequest({ model: 'm', messages: [{ role: 'tool', content: 'x' }] }).ok).toBe(false)
    expect(sanitizeChatRequest({ model: 'm', messages: [{ role: 'user', content: 1 }] }).ok).toBe(false)
    expect(sanitizeChatRequest({ model: 'm', messages: ['x'] }).ok).toBe(false)
  })

  it('message bị cắt field thừa (chỉ giữ role + content)', () => {
    const r = sanitizeChatRequest({
      model: 'm',
      messages: [{ role: 'user', content: 'hi', name: 'hack', tool_calls: [] }],
    })
    expect(r).toMatchObject({ ok: true })
    if (r.ok) expect(r.payload.messages[0]).toEqual({ role: 'user', content: 'hi' })
  })

  it('tổng ký tự vượt maxTotalChars → lỗi', () => {
    const r = sanitizeChatRequest(
      { model: 'm', messages: [user('aaaaaa')] },
      { maxTotalChars: 5 },
    )
    expect(r.ok).toBe(false)
  })

  it('không có model + không defaultModel → lỗi; có defaultModel → dùng nó', () => {
    expect(sanitizeChatRequest({ messages: [user('x')] }).ok).toBe(false)
    const r = sanitizeChatRequest({ messages: [user('x')] }, { defaultModel: 'claude-haiku-4-5' })
    expect(r).toMatchObject({ ok: true, payload: { model: 'claude-haiku-4-5' } })
  })

  it('allowlist: model ngoài danh sách → lỗi, trong danh sách → qua', () => {
    const opts = { allowedModels: ['a', 'b'] }
    expect(sanitizeChatRequest({ model: 'c', messages: [user('x')] }, opts).ok).toBe(false)
    expect(sanitizeChatRequest({ model: 'a', messages: [user('x')] }, opts).ok).toBe(true)
  })

  it('temperature/max_tokens: hợp lệ được giữ, không hợp lệ bị bỏ', () => {
    const ok = sanitizeChatRequest({
      model: 'm',
      messages: [user('x')],
      temperature: 0.7,
      max_tokens: 1024,
    })
    expect(ok).toMatchObject({ ok: true, payload: { temperature: 0.7, max_tokens: 1024 } })

    const bad = sanitizeChatRequest({
      model: 'm',
      messages: [user('x')],
      temperature: 99,
      max_tokens: -1,
    })
    expect(bad).toMatchObject({ ok: true })
    if (bad.ok) {
      expect(bad.payload.temperature).toBeUndefined()
      expect(bad.payload.max_tokens).toBeUndefined()
    }
  })
})
