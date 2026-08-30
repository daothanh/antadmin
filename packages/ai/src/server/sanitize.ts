import type { ChatMessage, ChatRole } from '../types'

export interface SanitizeOptions {
  /** Model dùng khi client không gửi. */
  defaultModel?: string
  /** Danh sách model cho phép; bỏ trống = chấp nhận mọi model client gửi. */
  allowedModels?: string[]
  /** Số message tối đa mỗi request (chặn payload phình). Mặc định 50. */
  maxMessages?: number
  /** Tổng ký tự tối đa của toàn bộ messages. Mặc định 100_000. */
  maxTotalChars?: number
}

/** Payload đã whitelist, sẵn sàng forward tới gateway OpenAI-compatible. */
export interface ChatGatewayPayload {
  model: string
  messages: ChatMessage[]
  stream: true
  temperature?: number
  max_tokens?: number
}

export type SanitizeResult =
  | { ok: true, payload: ChatGatewayPayload }
  | { ok: false, reason: string }

const VALID_ROLES = new Set<ChatRole>(['system', 'user', 'assistant'])

/**
 * Whitelist + validate body từ client trước khi forward tới gateway.
 * Nguyên tắc: client KHÔNG được đẩy param tuỳ ý xuống gateway — chỉ các field
 * đã duyệt (model/messages/temperature/max_tokens) đi qua, phần còn lại bị bỏ.
 */
export function sanitizeChatRequest(body: unknown, options: SanitizeOptions = {}): SanitizeResult {
  const maxMessages = options.maxMessages ?? 50
  const maxTotalChars = options.maxTotalChars ?? 100_000

  if (typeof body !== 'object' || body === null) {
    return { ok: false, reason: 'Body phải là object JSON' }
  }
  const raw = body as Record<string, unknown>

  if (!Array.isArray(raw.messages) || raw.messages.length === 0) {
    return { ok: false, reason: 'Thiếu messages' }
  }
  if (raw.messages.length > maxMessages) {
    return { ok: false, reason: `Quá ${maxMessages} messages` }
  }

  const messages: ChatMessage[] = []
  let totalChars = 0
  for (const item of raw.messages) {
    const msg = item as Record<string, unknown>
    if (
      typeof msg !== 'object' || msg === null
      || typeof msg.content !== 'string'
      || !VALID_ROLES.has(msg.role as ChatRole)
    ) {
      return { ok: false, reason: 'Message không hợp lệ (cần role hợp lệ + content string)' }
    }
    totalChars += msg.content.length
    // Chỉ giữ đúng 2 field — cắt mọi thứ khác client cố nhét vào message.
    messages.push({ role: msg.role as ChatRole, content: msg.content })
  }
  if (totalChars > maxTotalChars) {
    return { ok: false, reason: `Tổng nội dung vượt ${maxTotalChars} ký tự` }
  }

  const model = typeof raw.model === 'string' && raw.model ? raw.model : options.defaultModel
  if (!model) {
    return { ok: false, reason: 'Thiếu model (client không gửi và server không có defaultModel)' }
  }
  if (options.allowedModels?.length && !options.allowedModels.includes(model)) {
    return { ok: false, reason: `Model "${model}" không nằm trong allowlist` }
  }

  const payload: ChatGatewayPayload = { model, messages, stream: true }
  if (typeof raw.temperature === 'number' && raw.temperature >= 0 && raw.temperature <= 2) {
    payload.temperature = raw.temperature
  }
  if (typeof raw.max_tokens === 'number' && Number.isInteger(raw.max_tokens) && raw.max_tokens > 0) {
    payload.max_tokens = raw.max_tokens
  }

  return { ok: true, payload }
}
