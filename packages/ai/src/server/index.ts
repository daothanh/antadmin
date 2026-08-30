import type { H3Event } from 'h3'
import { createError, defineEventHandler, readBody } from 'h3'
import { sanitizeChatRequest, type SanitizeOptions } from './sanitize'

export { sanitizeChatRequest } from './sanitize'
export type { ChatGatewayPayload, SanitizeOptions, SanitizeResult } from './sanitize'

export interface AiChatProxyOptions extends SanitizeOptions {
  /** URL gốc gateway OpenAI-compatible (vd LiteLLM): https://ai.antadmin.vn/v1 */
  gatewayUrl: string
  /** API key app-level do gateway cấp — CHỈ tồn tại server-side, không bao giờ xuống client. */
  apiKey: string
  /**
   * Hook chặn request chưa đủ quyền (trả false → 401). Mặc định KHÔNG tự check —
   * khuyến nghị mount route sau middleware auth của @antadmin/nuxt-layer-base.
   */
  authorize?: (event: H3Event) => boolean | Promise<boolean>
}

/**
 * Tạo Nitro handler proxy chat-completions streaming tới AI gateway.
 * App sản phẩm dùng: tạo file `server/api/ai/chat.post.ts`:
 *
 *   import { createAiChatProxy } from '@antadmin/ai/server'
 *   export default createAiChatProxy({
 *     gatewayUrl: process.env.AI_GATEWAY_URL!,
 *     apiKey: process.env.AI_GATEWAY_KEY!,
 *     defaultModel: 'claude-sonnet-5',
 *   })
 */
export function createAiChatProxy(options: AiChatProxyOptions) {
  if (!options.gatewayUrl || !options.apiKey) {
    throw new Error('[@antadmin/ai] createAiChatProxy cần gatewayUrl và apiKey (đặt qua env, không hardcode)')
  }
  const base = options.gatewayUrl.replace(/\/$/, '')

  return defineEventHandler(async (event) => {
    if (options.authorize && !(await options.authorize(event))) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const result = sanitizeChatRequest(body, options)
    if (!result.ok) {
      throw createError({ statusCode: 400, statusMessage: result.reason })
    }

    const upstream = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify(result.payload),
    })

    if (!upstream.ok || !upstream.body) {
      // 401/403 từ gateway = key server cấu hình sai — báo 502, KHÔNG lộ chi tiết cho client.
      const status = upstream.status === 401 || upstream.status === 403 ? 502 : upstream.status
      console.error(`[@antadmin/ai] gateway trả ${upstream.status}: ${await upstream.text().catch(() => '')}`)
      throw createError({ statusCode: status, statusMessage: 'AI gateway error' })
    }

    // Pipe stream SSE về client nguyên vẹn.
    return new Response(upstream.body, {
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'text/event-stream',
        'cache-control': 'no-cache',
      },
    })
  })
}
