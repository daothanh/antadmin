<script setup lang="ts">
import { computed } from 'vue'
import { Tooltip } from 'ant-design-vue'

// Chỉ báo trạng thái active/inactive dạng chấm màu + tooltip.
// Không phụ thuộc thư viện icon — dùng chấm CSS để giữ @antadmin/ui gọn nhẹ.
defineOptions({ name: 'CStatus' })

const props = withDefaults(defineProps<{
  status: number | string | boolean
  activeValue?: number | string | boolean
  activeText?: string
  inactiveText?: string
  /** Hiện nhãn chữ bên cạnh chấm. */
  showText?: boolean
}>(), {
  activeValue: 1,
  activeText: 'Hoạt động',
  inactiveText: 'Không hoạt động',
  showText: false,
})

const isActive = computed(() =>
  props.status === true || props.status === props.activeValue,
)
const label = computed(() => (isActive.value ? props.activeText : props.inactiveText))
</script>

<template>
  <Tooltip :title="showText ? undefined : label">
    <span
      class="c-status"
      :class="isActive ? 'c-status--active' : 'c-status--inactive'"
    >
      <span class="c-status__dot" />
      <span
        v-if="showText"
        class="c-status__text"
      >{{ label }}</span>
    </span>
  </Tooltip>
</template>

<style scoped>
.c-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}
.c-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex: none;
}
.c-status--active .c-status__dot {
  background: var(--antadmin-color-success);
  box-shadow: 0 0 0 3px var(--antadmin-color-success-soft);
}
.c-status--inactive .c-status__dot {
  background: var(--antadmin-color-error);
  box-shadow: 0 0 0 3px var(--antadmin-color-error-soft);
}
.c-status--active .c-status__text {
  color: var(--antadmin-color-success);
}
.c-status--inactive .c-status__text {
  color: var(--antadmin-color-error);
}
</style>
