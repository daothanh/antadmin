import { getOidcMetadata } from '../../utils/oidc'
import { sanitizeRedirect } from '../../utils/redirect'
import { clearAntAdminSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const { oidc } = useRuntimeConfig(event)
  const redirect = sanitizeRedirect(getQuery(event).redirect)

  clearAntAdminSession(event)

  if (oidc.mock || !oidc.issuer) {
    return sendRedirect(event, redirect)
  }

  // Đăng xuất phía IdP nếu hỗ trợ end_session_endpoint.
  const metadata = await getOidcMetadata(oidc.issuer)
  if (metadata.end_session_endpoint) {
    const params = new URLSearchParams({
      client_id: oidc.clientId,
      post_logout_redirect_uri: oidc.postLogoutRedirectUri || redirect,
    })
    return sendRedirect(event, `${metadata.end_session_endpoint}?${params.toString()}`)
  }

  return sendRedirect(event, redirect)
})
