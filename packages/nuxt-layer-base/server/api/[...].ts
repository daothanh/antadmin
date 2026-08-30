import { refreshAccessToken } from '../utils/oidc'
import { getAntAdminSession, setAntAdminSession } from '../utils/session'

// BFF proxy: client gọi /api/**, Nitro chuyển tiếp tới backend gateway,
// kèm Authorization từ session (token nằm httpOnly cookie, không lộ ra client).
export default defineEventHandler(async (event) => {
  const { apiProxyTarget, oidc } = useRuntimeConfig(event)
  if (!apiProxyTarget) {
    throw createError({ statusCode: 500, statusMessage: 'apiProxyTarget chưa cấu hình.' })
  }

  const subPath = event.path.replace(/^\/api/, '') || '/'
  const target = `${apiProxyTarget.replace(/\/$/, '')}${subPath}`

  let session = getAntAdminSession(event)

  // Access token hết hạn → thử refresh (nếu có refresh_token + OIDC thật).
  // Không refresh được → bỏ token, để backend trả 401 thay vì forward token chết.
  if (session?.expiresAt && session.expiresAt <= Date.now()) {
    if (session.refreshToken && oidc.issuer && !oidc.mock) {
      const refreshed = await refreshAccessToken(oidc, session.refreshToken).catch(
        () => null,
      )
      if (refreshed) {
        session = {
          ...session,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? session.refreshToken,
          expiresAt: refreshed.expires_in
            ? Date.now() + refreshed.expires_in * 1000
            : undefined,
        }
        setAntAdminSession(event, session)
      } else {
        session = null
      }
    } else {
      session = null
    }
  }

  // BFF là NGUỒN AUTH DUY NHẤT: chặn client tự bơm Authorization, và không rò rỉ
  // cookie trình duyệt (gồm cả antadmin_session) sang backend gateway.
  const headers: Record<string, string> = {
    authorization: '',
    cookie: '',
  }
  if (session?.accessToken) {
    headers.authorization = `Bearer ${session.accessToken}`
  }

  return proxyRequest(event, target, { headers })
})
