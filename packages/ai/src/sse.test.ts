import { describe, expect, it, vi } from 'vitest'
import { createSseParser, extractDeltaContent } from './sse'

describe('createSseParser', () => {
  it('emit từng event data trọn vẹn', () => {
    const onEvent = vi.fn()
    const p = createSseParser(onEvent)
    p.feed('data: một\n\ndata: hai\n\n')
    expect(onEvent.mock.calls.map(c => c[0])).toEqual(['một', 'hai'])
  })

  it('chunk cắt giữa event → buffer chờ đủ mới emit', () => {
    const onEvent = vi.fn()
    const p = createSseParser(onEvent)
    p.feed('data: {"a"')
    expect(onEvent).not.toHaveBeenCalled()
    p.feed(':1}\n\n')
    expect(onEvent).toHaveBeenCalledWith('{"a":1}')
  })

  it('hỗ trợ CRLF', () => {
    const onEvent = vi.fn()
    const p = createSseParser(onEvent)
    p.feed('data: x\r\n\r\ndata: y\r\n\r\n')
    expect(onEvent.mock.calls.map(c => c[0])).toEqual(['x', 'y'])
  })

  it('bỏ qua dòng không phải data (comment/event)', () => {
    const onEvent = vi.fn()
    const p = createSseParser(onEvent)
    p.feed(': keep-alive\nevent: chunk\ndata: z\n\n')
    expect(onEvent.mock.calls.map(c => c[0])).toEqual(['z'])
  })

  it('flush emit phần dư còn trong buffer', () => {
    const onEvent = vi.fn()
    const p = createSseParser(onEvent)
    p.feed('data: cuối')
    expect(onEvent).not.toHaveBeenCalled()
    p.flush()
    expect(onEvent).toHaveBeenCalledWith('cuối')
    // flush lần nữa không emit lại.
    p.flush()
    expect(onEvent).toHaveBeenCalledTimes(1)
  })
})

describe('extractDeltaContent', () => {
  it('rút content từ chunk chuẩn OpenAI-compatible', () => {
    expect(
      extractDeltaContent('{"choices":[{"delta":{"content":"xin chào"}}]}'),
    ).toBe('xin chào')
  })

  it('[DONE] → null', () => {
    expect(extractDeltaContent('[DONE]')).toBeNull()
  })

  it('JSON hỏng → null (không throw)', () => {
    expect(extractDeltaContent('{oops')).toBeNull()
  })

  it('chunk không có delta content (metadata/role) → null', () => {
    expect(extractDeltaContent('{"choices":[{"delta":{"role":"assistant"}}]}')).toBeNull()
    expect(extractDeltaContent('{"choices":[]}')).toBeNull()
    expect(extractDeltaContent('{}')).toBeNull()
  })
})
