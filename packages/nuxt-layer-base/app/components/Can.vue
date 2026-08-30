<script setup lang="ts">
import { computed } from 'vue'
import { usePermission } from '@antadmin/composables'

// Bọc nội dung gating theo quyền. Dùng cho link/action button:
//   <Can permission="/attendance-summary/update"><CButton>Sửa</CButton></Can>
//   <Can :permissions="['/a','/b']" any>...</Can>   (any = chỉ cần 1)
// Slot #fallback hiển thị khi không có quyền.
const props = defineProps<{
  permission?: string
  permissions?: string[]
  /** true → cần BẤT KỲ quyền nào; mặc định cần TẤT CẢ. */
  any?: boolean
}>()

const { canAll, canAny } = usePermission()

const allowed = computed(() => {
  const list = props.permission
    ? [props.permission, ...(props.permissions ?? [])]
    : (props.permissions ?? [])
  if (list.length === 0) return true
  return props.any ? canAny(list) : canAll(list)
})
</script>

<template>
  <slot v-if="allowed" />
  <slot
    v-else
    name="fallback"
  />
</template>
