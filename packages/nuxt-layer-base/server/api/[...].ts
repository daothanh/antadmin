import { getAntAdminSession } from '../utils/session'

// BFF proxy: client gọi /api/**, Nitro chuyển tiếp tới backend gateway,
// kèm Authorization từ session (token nằm httpOnly cookie, không lộ ra client).
export default defineEventHandler((event) => {
  const { apiProxyTarget } = useRuntimeConfig(event)
  if (!apiProxyTarget) {
    throw createError({ statusCode: 500, statusMessage: 'apiProxyTarget chưa cấu hình.' })
  }

  const subPath = event.path.replace(/^\/api/, '') || '/'
  const target = `${apiProxyTarget.replace(/\/$/, '')}${subPath}`

  // Access token hết hạn → bỏ token, để backend trả 401 thay vì forward token chết.
  // Session IAM không giữ refresh token (cookie giới hạn 4KB) nên phải đăng nhập lại.
  const session = getAntAdminSession(event)
  const isExpired = session?.expiresAt ? session.expiresAt <= Date.now() : false

  // BFF là NGUỒN AUTH DUY NHẤT: chặn client tự bơm Authorization, và không rò rỉ
  // cookie trình duyệt (gồm cả antadmin_session) sang backend gateway.
  const headers: Record<string, string> = {
    authorization: '',
    cookie: '',
  }
  if (session?.accessToken && !isExpired) {
    headers.authorization = `Bearer ${session.accessToken}`
  }

  return proxyRequest(event, target, { headers })
})
