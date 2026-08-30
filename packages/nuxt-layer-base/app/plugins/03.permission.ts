import { createPermissionChecker, parseSuperRoles } from '@antadmin/composables'
import type { AuthUser } from '@antadmin/composables'

// Directive gating theo URI quyền (exact). Dùng cho action button/link:
//   v-can="'/attendance-summary/update'"          → không có quyền: ẩn element
//   v-can:disable="'/attendance-summary/delete'"  → không có quyền: disable
//   v-can="['/a', '/b']"                           → cần TẤT CẢ
// App CSR nên áp dụng phía client là đủ (backend vẫn phải tự enforce).
export default defineNuxtPlugin((nuxtApp) => {
  const user = useState<AuthUser | null>('antadmin:auth:user', () => null)
  const superRoles = parseSuperRoles(useRuntimeConfig().public.auth)

  function allowed(value: string | string[]): boolean {
    const checker = createPermissionChecker(
      user.value?.permissions ?? [],
      user.value?.roles ?? [],
      superRoles,
    )
    return (Array.isArray(value) ? value : [value]).every((uri) => checker.can(uri))
  }

  function apply(el: HTMLElement, binding: { value: string | string[]; arg?: string }) {
    const ok = allowed(binding.value)
    if (binding.arg === 'disable') {
      el.toggleAttribute('disabled', !ok)
      el.classList.toggle('is-disabled', !ok)
      el.style.pointerEvents = ok ? '' : 'none'
      el.style.opacity = ok ? '' : '0.5'
      return
    }
    // Chế độ ẩn — nhớ display gốc để khôi phục khi có quyền trở lại.
    if (!ok) {
      if (el.dataset.canDisplay === undefined) el.dataset.canDisplay = el.style.display
      el.style.display = 'none'
    } else if (el.dataset.canDisplay !== undefined) {
      el.style.display = el.dataset.canDisplay
      delete el.dataset.canDisplay
    }
  }

  nuxtApp.vueApp.directive('can', { mounted: apply, updated: apply })
})
