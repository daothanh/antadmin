<script setup lang="ts">
import { computed } from 'vue'

// Nhãn trạng thái dạng pill — nền mờ + chữ màu theo semantic token.
// Thay cho việc tự đặt màu rời rạc; luôn bám theme.
defineOptions({ name: 'CTag' })

const props = withDefaults(defineProps<{
  color?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
  /** Hiển thị chấm tròn dẫn đầu. */
  dot?: boolean
}>(), {
  color: 'default',
})

const classes = computed(() => ['c-tag', `c-tag--${props.color}`])
</script>

<template>
  <span :class="classes">
    <span
      v-if="dot"
      class="c-tag__dot"
    />
    <slot />
  </span>
</template>

<style scoped>
.c-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
}
.c-tag__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  flex: none;
}
.c-tag--default {
  background: var(--antadmin-color-surface-muted);
  color: var(--antadmin-color-text-muted);
}
.c-tag--primary {
  background: var(--antadmin-color-primary-soft);
  color: var(--antadmin-color-primary);
}
.c-tag--accent {
  background: var(--antadmin-color-accent-soft);
  color: var(--antadmin-color-accent);
}
.c-tag--success {
  background: var(--antadmin-color-success-soft);
  color: var(--antadmin-color-success);
}
.c-tag--warning {
  background: var(--antadmin-color-warning-soft);
  color: var(--antadmin-color-warning);
}
.c-tag--error {
  background: var(--antadmin-color-error-soft);
  color: var(--antadmin-color-error);
}
.c-tag--info {
  background: var(--antadmin-color-info-soft);
  color: var(--antadmin-color-info);
}
</style>
