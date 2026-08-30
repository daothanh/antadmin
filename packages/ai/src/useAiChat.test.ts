import { describe, expect, it, vi } from 'vitest'
import { useAiChat } from './useAiChat'

/** Response SSE giả từ danh sách chunk text (mỗi phần tử = 1 lần đọc từ network). */
function sseResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return new Response(stream, { status })
}

const delta = (content: string) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`

describe('useAiChat', () => {
  it('happy path: stream tích luỹ vào message assistant, status về idle', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([delta('Xin '), delta('chào'), 'data: [DONE]\n\n']),
    )
    const chat = useAiChat({ fetch: fetchMock })
    await chat.send('hello')

    expect(chat.messages.value).toEqual([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'Xin chào' },
    ])
    expect(chat.status.value).toBe('idle')
    expect(chat.error.value).toBeNull()
  })

  it('chunk mạng cắt giữa event vẫn ghép đúng', async () => {
    const full = delta('nguyên vẹn')
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([full.slice(0, 12), full.slice(12)]),
    )
    const chat = useAiChat({ fetch: fetchMock })
    await chat.send('x')
    expect(chat.messages.value[1]).toEqual({ role: 'assistant', content: 'nguyên vẹn' })
  })

  it('system + model được đưa vào payload nhưng system không vào messages hiển thị', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([delta('ok')]))
    const chat = useAiChat({ fetch: fetchMock, system: 'Bạn là trợ lý', model: 'claude-sonnet-5' })
    await chat.send('hi')

    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string)
    expect(body.model).toBe('claude-sonnet-5')
    expect(body.stream).toBe(true)
    expect(body.messages[0]).toEqual({ role: 'system', content: 'Bạn là trợ lý' })
    expect(chat.messages.value.some(m => m.role === 'system')).toBe(false)
  })

  it('response lỗi → status error, gỡ placeholder rỗng, giữ message user', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('boom', { status: 500 }))
    const chat = useAiChat({ fetch: fetchMock })
    await chat.send('hi')

    expect(chat.status.value).toBe('error')
    expect(chat.error.value).not.toBeNull()
    expect(chat.messages.value).toEqual([{ role: 'user', content: 'hi' }])
  })

  it('input rỗng/toàn khoảng trắng → không gửi', async () => {
    const fetchMock = vi.fn()
    const chat = useAiChat({ fetch: fetchMock })
    await chat.send('   ')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(chat.messages.value).toEqual([])
  })

  it('đang streaming thì send tiếp bị chặn', async () => {
    let release!: () => void
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        release = () => {
          controller.enqueue(new TextEncoder().encode(delta('xong')))
          controller.close()
        }
      },
    })
    const fetchMock = vi.fn().mockResolvedValue(new Response(stream, { status: 200 }))
    const chat = useAiChat({ fetch: fetchMock })

    const first = chat.send('một')
    // Chờ fetch resolve + bắt đầu đọc stream.
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(chat.status.value).toBe('streaming')

    await chat.send('hai') // bị chặn — không thêm message
    expect(chat.messages.value.filter(m => m.role === 'user')).toHaveLength(1)

    release()
    await first
    expect(chat.status.value).toBe('idle')
  })

  it('AbortError → status idle, không coi là lỗi', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new DOMException('bị huỷ', 'AbortError'))
    const chat = useAiChat({ fetch: fetchMock })
    await chat.send('hi')
    expect(chat.status.value).toBe('idle')
    expect(chat.error.value).toBeNull()
  })

  it('reset xoá hội thoại và state', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([delta('ok')]))
    const chat = useAiChat({ fetch: fetchMock })
    await chat.send('hi')
    chat.reset()
    expect(chat.messages.value).toEqual([])
    expect(chat.status.value).toBe('idle')
    expect(chat.error.value).toBeNull()
  })

  it('endpoint mặc định /api/ai/chat, override được', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([delta('ok')]))
    await useAiChat({ fetch: fetchMock }).send('a')
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/ai/chat')

    await useAiChat({ fetch: fetchMock, endpoint: '/api/custom' }).send('b')
    expect(fetchMock.mock.calls[1]![0]).toBe('/api/custom')
  })
})
