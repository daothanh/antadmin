import { ref, type Ref } from 'vue'
import { toAppError, type AppError } from '@antadmin/utils'
import { createSseParser, extractDeltaContent } from './sse'
import type { ChatMessage, ChatStatus } from './types'

export interface UseAiChatOptions {
  /** Endpoint BFF (Nitro) proxy tới AI gateway. Mặc định '/api/ai/chat'. */
  endpoint?: string
  /** Model gửi kèm request — BFF có thể override/chặn theo allowlist. */
  model?: string
  /** System prompt chèn đầu hội thoại khi gửi (không nằm trong `messages` hiển thị). */
  system?: string
  /** fetch tuỳ biến (phục vụ test). Mặc định globalThis.fetch. */
  fetch?: typeof globalThis.fetch
}

/**
 * Chat streaming với AI gateway qua BFF — client không bao giờ giữ API key.
 * Chỉ dùng client-side (page mặc định CSR); response đọc dạng SSE, nội dung
 * assistant được cập nhật dần vào message cuối để UI render theo thời gian thực.
 */
export function useAiChat(options: UseAiChatOptions = {}) {
  const endpoint = options.endpoint ?? '/api/ai/chat'
  const doFetch: typeof globalThis.fetch =
    options.fetch ?? ((input, init) => globalThis.fetch(input, init))

  const messages: Ref<ChatMessage[]> = ref([])
  const status = ref<ChatStatus>('idle')
  const error = ref<AppError | null>(null)
  let controller: AbortController | null = null

  async function send(content: string): Promise<void> {
    // Chặn gửi chồng khi đang stream — UI nên disable input theo status.
    if (status.value === 'streaming') return
    const text = content.trim()
    if (!text) return

    error.value = null
    messages.value.push({ role: 'user', content: text })

    // Payload gửi đi = system (nếu có) + toàn bộ hội thoại hiện tại.
    const payload: ChatMessage[] = options.system
      ? [{ role: 'system', content: options.system }, ...messages.value]
      : [...messages.value]

    // Placeholder assistant — LẤY LẠI từ mảng reactive để mutation trigger render
    // (mutate object gốc ngoài proxy sẽ không được Vue theo dõi).
    messages.value.push({ role: 'assistant', content: '' })
    const assistant = messages.value[messages.value.length - 1]!

    status.value = 'streaming'
    controller = new AbortController()

    try {
      const res = await doFetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: options.model, messages: payload, stream: true }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) {
        throw toAppError({ statusCode: res.status, message: `AI endpoint trả ${res.status}` })
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const parser = createSseParser((raw) => {
        const delta = extractDeltaContent(raw)
        if (delta) assistant.content += delta
      })

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        parser.feed(decoder.decode(value, { stream: true }))
      }
      parser.flush()
      status.value = 'idle'
    } catch (err) {
      // Người dùng chủ động dừng: giữ phần đã stream, không coi là lỗi.
      if (err instanceof DOMException && err.name === 'AbortError') {
        status.value = 'idle'
        return
      }
      // Lỗi thật: gỡ placeholder rỗng cho sạch UI, giữ message user để gửi lại.
      if (assistant.content === '') messages.value.pop()
      error.value = toAppError(err)
      status.value = 'error'
    } finally {
      controller = null
    }
  }

  /** Dừng stream đang chạy (giữ phần nội dung đã nhận). */
  function abort(): void {
    controller?.abort()
  }

  /** Xoá hội thoại, đưa state về ban đầu. */
  function reset(): void {
    abort()
    messages.value = []
    status.value = 'idle'
    error.value = null
  }

  return { messages, status, error, send, abort, reset }
}
