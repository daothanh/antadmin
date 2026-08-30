import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthProvider, AuthUser } from './types'

const mocks = vi.hoisted(() => ({
  nuxtApp: {} as Record<string, unknown>,
  state: new Map<string, unknown>(),
}))

vi.mock('nuxt/app', async () => {
  const { ref } = await import('vue')
  return {
    useNuxtApp: () => mocks.nuxtApp,
    useState: <T,>(key: string, init: () => T) => {
      if (!mocks.state.has(key)) mocks.state.set(key, ref(init()))
      return mocks.state.get(key)
    },
  }
})

import { useAuth } from './useAuth'

const alice: AuthUser = { id: '1', name: 'Alice', roles: ['admin'], permissions: [] }

function provider(overrides: Partial<AuthProvider> = {}): AuthProvider {
  return {
    login: vi.fn(),
    logout: vi.fn(),
    handleCallback: vi.fn(async () => null),
    refresh: vi.fn(async () => true),
    getUser: vi.fn(async () => null),
    ...overrides,
  }
}

function setProvider(p: AuthProvider | undefined) {
  mocks.nuxtApp = p ? { $antadminAuth: p } : {}
}

describe('useAuth', () => {
  beforeEach(() => {
    mocks.state.clear()
    mocks.nuxtApp = {}
  })

  it('chưa đăng nhập → user null, isAuthenticated false', () => {
    setProvider(provider())
    const { user, isAuthenticated } = useAuth()
    expect(user.value).toBeNull()
    expect(isAuthenticated.value).toBe(false)
  })

  it('loginWithPassword thành công → set user + isAuthenticated true', async () => {
    const loginWithPassword = vi.fn(async () => alice)
    setProvider(provider({ loginWithPassword }))
    const auth = useAuth()
    const result = await auth.loginWithPassword({ username: 'a', password: 'b' })
    expect(result).toEqual(alice)
    expect(auth.user.value).toEqual(alice)
    expect(auth.isAuthenticated.value).toBe(true)
    expect(loginWithPassword).toHaveBeenCalledWith({ username: 'a', password: 'b' })
  })

  it('loginWithPassword ném lỗi nếu provider không hỗ trợ form', async () => {
    setProvider(provider()) // không có loginWithPassword
    await expect(
      useAuth().loginWithPassword({ username: 'a', password: 'b' }),
    ).rejects.toThrow(/không hỗ trợ đăng nhập bằng form/)
  })

  it('logout gọi provider và xoá user state', async () => {
    const logout = vi.fn()
    setProvider(provider({ logout, loginWithPassword: vi.fn(async () => alice) }))
    const auth = useAuth()
    await auth.loginWithPassword({ username: 'a', password: 'b' })
    await auth.logout('/goodbye')
    expect(logout).toHaveBeenCalledWith('/goodbye')
    expect(auth.user.value).toBeNull()
    expect(auth.isAuthenticated.value).toBe(false)
  })

  it('fetchUser đồng bộ user từ provider.getUser', async () => {
    setProvider(provider({ getUser: vi.fn(async () => alice) }))
    const auth = useAuth()
    const fetched = await auth.fetchUser()
    expect(fetched).toEqual(alice)
    expect(auth.user.value).toEqual(alice)
  })

  it('refresh uỷ quyền cho provider.refresh', async () => {
    const refresh = vi.fn(async () => false)
    setProvider(provider({ refresh }))
    expect(await useAuth().refresh()).toBe(false)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('ném lỗi rõ ràng khi chưa đăng ký AuthProvider', async () => {
    setProvider(undefined)
    await expect(useAuth().login()).rejects.toThrow(/AuthProvider chưa được đăng ký/)
  })
})
