/** Vai trò message trong hội thoại chat (theo chuẩn OpenAI-compatible). */
export type ChatRole = 'system' | 'user' | 'assistant'

/** Một message trong hội thoại. */
export interface ChatMessage {
  role: ChatRole
  content: string
}

/** Trạng thái vòng đời của một phiên chat streaming. */
export type ChatStatus = 'idle' | 'streaming' | 'error'
