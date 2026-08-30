import { computed } from 'vue'
import { useAppConfig, useCookie } from 'nuxt/app'
import type { ThemeMode } from '@antadmin/theme'

const THEME_COOKIE = 'antadmin:theme'

/**
 * Quản lý chế độ sáng/tối ở runtime. Lưu qua cookie (SSR đọc được → không chớp
 * theme khi tải lại). Giá trị mặc định lấy từ appConfig.antadmin.themeMode.
 *
 * app.vue của layer dùng `mode` để đổi antd algorithm + CSS vars `--antadmin-*`.
 */
export function useThemeMode() {
  const appConfig = useAppConfig() as { antadmin?: { themeMode?: ThemeMode } }
  const fallback: ThemeMode = appConfig.antadmin?.themeMode === 'dark' ? 'dark' : 'light'

  const mode = useCookie<ThemeMode>(THEME_COOKIE, {
    default: () => fallback,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  const isDark = computed(() => mode.value === 'dark')

  function setMode(next: ThemeMode): void {
    mode.value = next
  }

  function toggle(): void {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  return { mode, isDark, setMode, toggle }
}
