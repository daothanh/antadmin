// Kiểm tra quyền theo route meta `permissions`. Chạy sau auth.global (thứ tự tên file).
// Team khai báo: definePageMeta({ permissions: ['order.read'] })
//
// ⚠️ CHỈ là gating phía CLIENT (UX) — KHÔNG phải lớp bảo mật. Backend gateway phải
// tự enforce quyền trên mỗi request (xem README "Bảo mật").
export default defineNuxtRouteMiddleware((to) => {
  // Hỗ trợ `permission` (1 URI) và `permissions` (cần TẤT CẢ).
  const single = to.meta.permission as string | undefined
  const many = (to.meta.permissions as string[] | undefined) ?? []
  const required = single ? [single, ...many] : many
  if (required.length === 0) return

  const { canAll } = usePermission()
  if (!canAll(required)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bạn không có quyền truy cập trang này.',
    })
  }
})
