import type { AuthProvider, AuthUser, LoginCredentials } from '@antadmin/composables'

interface SessionResponse {
  user: AuthUser | null
}

// Cung cấp AuthProvider (form đăng nhập first-party, BFF đổi credential lấy token IAM) tại
// nuxtApp.$antadminAuth và khởi tạo user state. Tập đoàn có thể thay provider khác sau.
export default defineNuxtPlugin(async () => {
  const requestFetch = useRequestFetch()

  async function loadSession(): Promise<AuthUser | null> {
    try {
      const session = await requestFetch<SessionResponse>('/auth/session')
      return session.user
    } catch {
      return null
    }
  }

  const provider: AuthProvider = {
    async login(redirectTo) {
      const redirect = redirectTo ?? useRoute().fullPath
      // Trang login là Vue page nội bộ (form first-party), không redirect ra ngoài.
      await navigateTo(`/auth/login?redirect=${encodeURIComponent(redirect)}`)
    },
    async loginWithPassword(credentials: LoginCredentials): Promise<AuthUser> {
      // Credential POST thẳng tới BFF (HTTPS) → session seal httpOnly. BFF trả user.
      const { user } = await $fetch<SessionResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      })
      if (!user) throw new Error('Đăng nhập thất bại.')
      return user
    },
    async logout(redirectTo) {
      const redirect = redirectTo ?? '/'
      await navigateTo(`/auth/logout?redirect=${encodeURIComponent(redirect)}`, {
        external: true,
      })
    },
    handleCallback() {
      // Đăng nhập bằng form nên không có redirect callback từ IdP; giữ hàm cho đủ AuthProvider.
      return Promise.resolve(null)
    },
    async refresh() {
      return (await loadSession()) != null
    },
    getUser() {
      return loadSession()
    },
  }

  // Khởi tạo user state (SSR forward cookie qua useRequestFetch).
  const user = useState<AuthUser | null>('antadmin:auth:user', () => null)
  if (user.value == null) {
    user.value = await loadSession()
  }

  return {
    provide: {
      antadminAuth: provider,
    },
  }
})
