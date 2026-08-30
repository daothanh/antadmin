// Client-side: composable chat streaming + tiện ích SSE.
export { useAiChat } from './useAiChat'
export type { UseAiChatOptions } from './useAiChat'
export { createSseParser, extractDeltaContent } from './sse'
export type { ChatMessage, ChatRole, ChatStatus } from './types'

// Server-side (Nitro) import từ '@antadmin/ai/server' — KHÔNG re-export ở đây
// để bundle client không kéo theo h3.
