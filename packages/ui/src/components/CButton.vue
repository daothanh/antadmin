<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Button } from 'ant-design-vue'

// Nút chuẩn hoá AntAdmin — entry point thay cho a-button.
// variant phủ các kiểu dùng nhiều ở sản phẩm nội bộ (tham khảo OneAuto);
// style bám biến --antadmin-* nên luôn đồng bộ theme.
defineOptions({ name: 'CButton', inheritAttrs: false })

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' | 'text'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
})

const attrs = useAttrs()

// Map variant → antd `type` (giữ hành vi gốc: focus ring, loading, ...).
const antType = computed(() => {
  switch (props.variant) {
    case 'primary':
    case 'danger':
      return 'primary'
    case 'link':
      return 'link'
    case 'text':
      return 'text'
    default:
      return 'default'
  }
})

const danger = computed(
  () => props.variant === 'danger' || attrs.danger === '' || attrs.danger === true,
)

const classes = computed(() => [
  'c-btn',
  `c-btn--${props.variant}`,
  `c-btn--${props.size}`,
  { 'c-btn--block': props.block },
])
</script>

<template>
  <Button
    :type="antType"
    :danger="danger || undefined"
    :class="classes"
    v-bind="attrs"
  >
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
    <slot />
  </Button>
</template>

<style scoped>
.c-btn {
  font-weight: 600;
  box-shadow: none !important;
  border-width: 1px;
}
.c-btn--block {
  width: 100%;
}

/* Cỡ */
.c-btn--sm {
  min-height: 30px;
  padding-inline: 12px;
  font-size: 12px;
}
.c-btn--md {
  min-height: var(--antadmin-control-height, 36px);
  padding-inline: 14px;
  font-size: 14px;
}
.c-btn--lg {
  min-height: 42px;
  padding-inline: 20px;
  font-size: 15px;
}

/* Primary — gradient thương hiệu */
.c-btn--primary:not(:disabled) {
  background: var(--antadmin-gradient-primary);
  border-color: var(--antadmin-color-primary);
  color: #fff;
}
.c-btn--primary:not(:disabled):hover {
  filter: brightness(1.08);
  color: #fff;
}

/* Secondary / Outline — nền trắng viền */
.c-btn--secondary:not(:disabled),
.c-btn--outline:not(:disabled) {
  background: var(--antadmin-color-surface);
  border-color: var(--antadmin-color-border-strong);
  color: var(--antadmin-color-primary);
}
.c-btn--secondary:not(:disabled):hover,
.c-btn--outline:not(:disabled):hover {
  border-color: var(--antadmin-color-primary);
  color: var(--antadmin-color-primary-hover);
}

/* Ghost — nền mờ primary */
.c-btn--ghost:not(:disabled) {
  background: var(--antadmin-color-primary-soft);
  border-color: transparent;
  color: var(--antadmin-color-primary);
}
.c-btn--ghost:not(:disabled):hover {
  background: var(--antadmin-color-primary-soft);
  color: var(--antadmin-color-primary-hover);
}

/* Danger — gradient đỏ */
.c-btn--danger:not(:disabled) {
  background: var(--antadmin-gradient-danger);
  border-color: var(--antadmin-color-error);
  color: #fff;
}
.c-btn--danger:not(:disabled):hover {
  filter: brightness(1.08);
  color: #fff;
}

/* Link / Text */
.c-btn--link:not(:disabled) {
  color: var(--antadmin-color-primary);
  font-weight: 600;
}
.c-btn--link:not(:disabled):hover {
  color: var(--antadmin-color-primary-hover);
}
.c-btn--text:not(:disabled) {
  color: var(--antadmin-color-text);
  font-weight: 500;
}
.c-btn--text:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--antadmin-color-primary-hover);
}
</style>
