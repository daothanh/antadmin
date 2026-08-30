import type { AuthConfig } from '../../utils/iam'
import { fetchUserInfo } from '../../utils/iam'
import { getAntAdminSession } from '../../utils/session'

// Trả user hiện tại cho client (plugin auth gọi để khởi tạo state).
// roles/permissions KHÔNG nằm trong cookie (quá lớn) → lấy tươi từ userInfo bằng
// accessToken đã seal. Lỗi (token hết hạn) → coi như chưa đăng nhập.
export default defineEventHandler(async (event) => {
  const { auth } = useRuntimeConfig(event) as unknown as { auth: AuthConfig }
  const session = getAntAdminSession(event)
  if (!session) return { user: null }

  if (auth.mock || !session.accessToken) {
    return { user: session.user ?? null }
  }

  try {
    const user = await fetchUserInfo(auth, session.accessToken)
    return { user }
  } catch {
    return { user: null }
  }
})
