// Yêu cầu đăng nhập cho mọi route, trừ route khai báo `auth: false`.
export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.auth === false) return

  const { isAuthenticated } = useAuth()
  if (!isAuthenticated.value) {
    // Trang login là Vue page nội bộ — điều hướng client, không reload external.
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
