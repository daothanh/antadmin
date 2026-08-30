import type { AuthConfig, LoginPayload } from '../../utils/iam'
import { fetchUserInfo, iamLogin } from '../../utils/iam'
import { setAntAdminSession } from '../../utils/session'

// BFF nhận credential từ form, đổi lấy token ở IAM, lấy userinfo, rồi seal session
// vào cookie httpOnly. Password/OTP CHỈ đi qua đây (HTTPS) — không lộ ra client.
export default defineEventHandler(async (event) => {
  const { auth } = useRuntimeConfig(event) as unknown as { auth: AuthConfig }
  const body = await readBody<Partial<LoginPayload>>(event)

  const username = body.username?.trim()
  const password = body.password
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu tên đăng nhập hoặc mật khẩu.' })
  }

  const payload: LoginPayload = {
    clientId: body.clientId,
    username,
    password,
    method: body.method,
    otp: body.otp,
    transactionId: body.transactionId,
  }

  // DEV: bỏ qua IAM, tạo session giả để chạy end-to-end.
  if (auth.mock) {
    const user = {
      id: 'mock-user',
      name: `Người dùng ${username}`,
      email: `${username}@antadmin.vn`,
      roles: ['admin'],
      permissions: ['order.read', 'order.write'],
    }
    setAntAdminSession(event, { user })
    return { user }
  }

  const tokens = await iamLogin(auth, payload)
  const user = await fetchUserInfo(auth, tokens.accessToken)

  // Cookie sealed chỉ giữ token + identity tối thiểu: accessToken JWT đã ~2.4KB,
  // còn roles/permissions (hàng trăm mục) sẽ vượt giới hạn 4KB của cookie.
  // roles/permissions lấy tươi ở /auth/session qua userInfo. Không lưu refreshToken
  // (thêm ~1 JWT nữa là tràn cookie) — token IAM sống 24h, hết hạn thì đăng nhập lại.
  setAntAdminSession(event, {
    user: { id: user.id, name: user.name, email: user.email, roles: [], permissions: [] },
    accessToken: tokens.accessToken,
    expiresAt: tokens.expiresAt,
  })

  return { user }
})
