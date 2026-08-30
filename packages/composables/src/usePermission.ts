import { computed } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuth } from './useAuth'
import { createPermissionChecker, parseSuperRoles } from './permission'

export * from './permission'

/**
 * Kiểm tra quyền/role dựa trên user hiện tại. Chỉ là logic guard (UX) —
 * KHÔNG chứa flow đăng nhập (xem useAuth), backend vẫn phải tự enforce.
 * Permission là URI (exact match); super-role (public.auth.superRoles) bỏ qua check.
 */
export function usePermission() {
  const { user } = useAuth()
  const superRoles = parseSuperRoles(useRuntimeConfig().public.auth)

  const checker = computed(() =>
    createPermissionChecker(user.value?.permissions ?? [], user.value?.roles ?? [], superRoles),
  )

  return {
    can: (uri: string) => checker.value.can(uri),
    /** Alias ngữ nghĩa route/trang. */
    canAccess: (uri: string) => checker.value.can(uri),
    canAll: (uris: string[]) => checker.value.canAll(uris),
    canAny: (uris: string[]) => checker.value.canAny(uris),
    hasRole: (role: string) => checker.value.hasRole(role),
    hasAnyRole: (roles: string[]) => checker.value.hasAnyRole(roles),
    /** Lọc mảng {permission?, children?} — bỏ item user không có quyền. */
    filterByPermission: <T extends { permission?: string; children?: T[] }>(items: T[]) =>
      checker.value.filterByPermission(items),
  }
}
