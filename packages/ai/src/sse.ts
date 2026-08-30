/**
 * Parser SSE (Server-Sent Events) tối giản cho stream chat-completions.
 * Chunk mạng có thể cắt giữa chừng một event — parser giữ phần dư trong buffer
 * và chỉ emit khi đủ một event trọn vẹn (ngăn cách bằng dòng trống).
 */
export function createSseParser(onEvent: (data: string) => void): {
  feed: (chunk: string) => void
  flush: () => void
} {
  let buffer = ''

  function emit(block: string): void {
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('data:')) {
        onEvent(line.slice('data:'.length).trim())
      }
    }
  }

  return {
    feed(chunk: string): void {
      buffer += chunk
      const parts = buffer.split(/\r?\n\r?\n/)
      // Phần cuối có thể là event chưa trọn — giữ lại chờ chunk sau.
      buffer = parts.pop() ?? ''
      for (const part of parts) emit(part)
    },
    flush(): void {
      if (buffer) {
        emit(buffer)
        buffer = ''
      }
    },
  }
}

/**
 * Rút delta text từ một event chat-completions dạng OpenAI-compatible
 * (LiteLLM và đa số gateway đều theo chuẩn này). Trả null với `[DONE]`,
 * JSON hỏng, hoặc chunk không có nội dung (vd chunk metadata đầu stream).
 */
export function extractDeltaContent(raw: string): string | null {
  if (raw === '[DONE]') return null
  try {
    const parsed = JSON.parse(raw) as {
      choices?: Array<{ delta?: { content?: string | null } }>
    }
    return parsed.choices?.[0]?.delta?.content ?? null
  } catch {
    return null
  }
}
