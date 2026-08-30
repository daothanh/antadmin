import { computed } from 'vue'
import { useNuxtApp, useState } from 'nuxt/app'
import type { AuthProvider, AuthUser, LoginCredentials } from './types'

const USER_STATE_KEY = 'antadmin:auth:user'

function resolveProvider(): AuthProvider {
  // Provider được @antadmin/nuxt-layer-base inject qua plugin (nuxtApp.$antadminAuth).
  const provider = (useNuxtApp() as { $antadminAuth?: AuthProvider }).$antadminAuth
  if (!provider) {
    throw new Error(
      '[antadmin] AuthProvider chưa được đăng ký. Hãy extends @antadmin/nuxt-layer-base.',
    )
  }
  return provider
}

/**
 * State + hành động auth. Flow đăng nhập thực tế nằm ở AuthProvider (abstract),
 * team sản phẩm không tự viết lại SSO.
 */
export function useAuth() {
  const user = useState<AuthUser | null>(USER_STATE_KEY, () => null)
  const isAuthenticated = computed(() => user.value != null)

  async function login(redirectTo?: string): Promise<void> {
    await resolveProvider().login(redirectTo)
  }

  /**
   * Đăng nhập bằng form (username/password/OTP) qua BFF. Cập nhật user state khi
   * thành công. Ném lỗi nếu provider không hỗ trợ hoặc credential sai.
   */
  async function loginWithPassword(credentials: LoginCredentials): Promise<AuthUser> {
    const provider = resolveProvider()
    if (!provider.loginWithPassword) {
      throw new Error('[antadmin] Provider hiện tại không hỗ trợ đăng nhập bằng form.')
    }
    const authenticated = await provider.loginWithPassword(credentials)
    user.value = authenticated
    return authenticated
  }

  async function logout(redirectTo?: string): Promise<void> {
    await resolveProvider().logout(redirectTo)
    user.value = null
  }

  async function refresh(): Promise<boolean> {
    return resolveProvider().refresh()
  }

  async function fetchUser(): Promise<AuthUser | null> {
    const current = await resolveProvider().getUser()
    user.value = current
    return current
  }

  return { user, isAuthenticated, login, loginWithPassword, logout, refresh, fetchUser }
}
