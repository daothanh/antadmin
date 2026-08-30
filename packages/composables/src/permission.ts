// Lõi kiểm quyền THUẦN — không phụ thuộc Nuxt/Vue → unit test trực tiếp.
// Permission là URI hành động (vd '/attendance-summary/search'), so khớp EXACT.

/** Chuẩn hoá URI: cắt query + bỏ dấu '/' cuối để tránh sai lệch vặt. */
export function normalizeUri(uri: string): string {
  const path = uri.split('?')[0] ?? uri
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

export interface PermissionChecker {
  can(uri: string): boolean
  canAll(uris: string[]): boolean
  canAny(uris: string[]): boolean
  hasRole(role: string): boolean
  hasAnyRole(roles: string[]): boolean
  filterByPermission<T extends { permission?: string; children?: T[] }>(items: T[]): T[]
}

/**
 * Tạo checker từ danh sách permission/role. Super-role bỏ qua mọi check (admin).
 * Item không khai `permission` luôn được giữ.
 */
export function createPermissionChecker(
  permissions: string[],
  roles: string[],
  superRoles: string[] = [],
): PermissionChecker {
  const granted = new Set(permissions.map(normalizeUri))
  const roleSet = new Set(roles)
  const isSuper = superRoles.some((role) => roleSet.has(role))

  const can = (uri: string): boolean => isSuper || granted.has(normalizeUri(uri))

  function filterByPermission<T extends { permission?: string; children?: T[] }>(
    items: T[],
  ): T[] {
    return items
      .filter((item) => !item.permission || can(item.permission))
      .map((item) => (item.children ? { ...item, children: filterByPermission(item.children) } : item))
  }

  return {
    can,
    canAll: (uris) => uris.every(can),
    canAny: (uris) => uris.some(can),
    hasRole: (role) => roleSet.has(role),
    hasAnyRole: (roles) => roles.some((role) => roleSet.has(role)),
    filterByPermission,
  }
}

/** Danh sách super-role từ public.auth.superRoles (chuỗi 'a,b' hoặc mảng). */
export function parseSuperRoles(source: unknown): string[] {
  const raw = (source as { superRoles?: unknown } | undefined)?.superRoles
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}
