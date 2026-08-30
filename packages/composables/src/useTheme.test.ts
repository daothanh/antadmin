import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ThemeMode } from '@antadmin/theme'

const mocks = vi.hoisted(() => ({
  appConfig: {} as { antadmin?: { themeMode?: ThemeMode } },
  cookies: new Map<string, unknown>(),
}))

vi.mock('nuxt/app', async () => {
  const { ref } = await import('vue')
  return {
    useAppConfig: () => mocks.appConfig,
    useCookie: <T,>(key: string, opts?: { default?: () => T }) => {
      if (!mocks.cookies.has(key)) mocks.cookies.set(key, ref(opts?.default?.()))
      return mocks.cookies.get(key)
    },
  }
})

import { useThemeMode } from './useTheme'

describe('useThemeMode', () => {
  beforeEach(() => {
    mocks.appConfig = {}
    mocks.cookies.clear()
  })

  it('mặc định light khi appConfig không cấu hình', () => {
    const { mode, isDark } = useThemeMode()
    expect(mode.value).toBe('light')
    expect(isDark.value).toBe(false)
  })

  it('lấy mặc định từ appConfig.antadmin.themeMode', () => {
    mocks.appConfig = { antadmin: { themeMode: 'dark' } }
    const { mode, isDark } = useThemeMode()
    expect(mode.value).toBe('dark')
    expect(isDark.value).toBe(true)
  })

  it('setMode đổi mode và cập nhật isDark', () => {
    const { setMode, isDark } = useThemeMode()
    setMode('dark')
    expect(isDark.value).toBe(true)
    setMode('light')
    expect(isDark.value).toBe(false)
  })

  it('toggle lật qua lại light ↔ dark', () => {
    const { mode, toggle } = useThemeMode()
    expect(mode.value).toBe('light')
    toggle()
    expect(mode.value).toBe('dark')
    toggle()
    expect(mode.value).toBe('light')
  })
})
