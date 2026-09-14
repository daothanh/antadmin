import { sanitizeRedirect } from '../../utils/redirect'
import { clearAntAdminSession } from '../../utils/session'

export default defineEventHandler((event) => {
  const redirect = sanitizeRedirect(getQuery(event).redirect)

  clearAntAdminSession(event)

  return sendRedirect(event, redirect)
})
