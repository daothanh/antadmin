import type { AuthConfig } from '../../../utils/iam'
import { sendOtp } from '../../../utils/iam'

// Gửi OTP (Telegram) trước khi đăng nhập — login/request. IAM cần username +
// password + clientId. Google Authenticator KHÔNG cần bước này.
export default defineEventHandler(async (event) => {
  const { auth } = useRuntimeConfig(event) as unknown as { auth: AuthConfig }
  const body = await readBody<{ username?: string; password?: string; clientId?: string }>(event)

  const username = body.username?.trim()
  if (!username || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu tên đăng nhập hoặc mật khẩu.' })
  }

  if (auth.mock) {
    return { transactionId: 'mock-transaction' }
  }

  return sendOtp(auth, { username, password: body.password, clientId: body.clientId })
})
