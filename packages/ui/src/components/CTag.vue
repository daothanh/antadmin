<script setup lang="ts">
import { computed } from 'vue'
import { IconX } from '@tabler/icons-vue'

// Nhãn trạng thái dạng pill — nền mờ + chữ màu theo semantic token.
// Thay cho việc tự đặt màu rời rạc; luôn bám theme.
defineOptions({ name: 'CTag' })

const props = withDefaults(defineProps<{
  color?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
  /** Hiển thị chấm tròn dẫn đầu. */
  dot?: boolean
  /** Hiện nút ✕ ở cuối (sự kiện close) — vd thẻ điều kiện lọc. */
  closable?: boolean
  /** Nhãn đọc màn hình của nút ✕ — nên nêu rõ đối tượng bị xoá. */
  closeText?: string
}>(), {
  color: 'default',
  closeText: 'Xoá',
})

const emit = defineEmits<{
  close: []
}>()

const classes = computed(() => ['c-tag', `c-tag--${props.color}`])
</script>

<template>
  <span :class="classes">
    <span
      v-if="dot"
      class="c-tag__dot"
    />
    <slot />
    <!-- Nút thật (không phải icon gắn click như Tag closable của antdv) để focus/bấm được bằng bàn phím. -->
    <button
      v-if="closable"
      type="button"
      class="c-tag__close"
      :aria-label="closeText"
      @click="emit('close')"
    >
      <IconX :size="12" />
    </button>
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
.c-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin-inline-end: -4px;
  padding: 2px;
  color: inherit;
  background: none;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.c-tag__close:hover,
.c-tag__close:focus-visible {
  opacity: 1;
}
.c-tag__close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 1px;
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
