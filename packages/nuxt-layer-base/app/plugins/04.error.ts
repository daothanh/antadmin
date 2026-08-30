import { useErrorHandler } from '@antadmin/ui'

// Error handler toàn cục:
//  - 401 → điều hướng về trang đăng nhập (client redirect).
//  - Bắt lỗi Vue chưa xử lý (render/setup) làm lưới an toàn → hiển thị nhất quán.
//  - Cung cấp `$antadminError` để caller opt-in: `catch (e) { $antadminError(e) }`.
// Toast/notification do @antadmin/ui đảm nhiệm (message vs notification theo severity).
export default defineNuxtPlugin((nuxtApp) => {
  const { handleError } = useErrorHandler({
    onAuthError: () => {
      // Tránh vòng lặp nếu đang ở sẵn trang login.
      const route = useRoute()
      if (!route.path.startsWith('/auth/login')) {
        navigateTo(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
      }
    },
  })

  // Lưới an toàn cho lỗi Vue chưa bắt (không thay thế try/catch chủ động của caller).
  nuxtApp.vueApp.config.errorHandler = (err) => {
    handleError(err)
  }
  nuxtApp.hook('vue:error', (err) => {
    handleError(err)
  })

  return {
    provide: {
      // const { $antadminError } = useNuxtApp()
      antadminError: handleError,
    },
  }
})
