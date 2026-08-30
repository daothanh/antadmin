<script setup lang="ts">
import { computed } from 'vue'

// Thẻ chỉ số (KPI) cho dashboard: nhãn + giá trị + biến động (trend) tuỳ chọn.
// Slot #icon (biểu tượng đầu thẻ), #suffix (đơn vị sau giá trị).
defineOptions({ name: 'CStatistic' })

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  /** Phần trăm biến động; dương → tăng (xanh), âm → giảm (đỏ). */
  trend?: number
  accent?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
}>(), {
  trend: undefined,
  accent: 'primary',
})

const trendClass = computed(() =>
  props.trend === undefined ? '' : props.trend >= 0 ? 'c-stat__trend--up' : 'c-stat__trend--down',
)
const trendText = computed(() =>
  props.trend === undefined ? '' : `${props.trend >= 0 ? '▲' : '▼'} ${Math.abs(props.trend)}%`,
)
</script>

<template>
  <div
    class="c-stat"
    :class="`c-stat--${accent}`"
  >
    <div
      v-if="$slots.icon"
      class="c-stat__icon"
    >
      <slot name="icon" />
    </div>
    <div class="c-stat__body">
      <span class="c-stat__label">{{ label }}</span>
      <div class="c-stat__value-row">
        <span class="c-stat__value">{{ value }}</span>
        <span
          v-if="$slots.suffix"
          class="c-stat__suffix"
        ><slot name="suffix" /></span>
      </div>
      <span
        v-if="trend !== undefined"
        class="c-stat__trend"
        :class="trendClass"
      >{{ trendText }}</span>
    </div>
  </div>
</template>

<style scoped>
.c-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--antadmin-color-surface);
  border: 1px solid var(--antadmin-color-border);
  border-radius: var(--antadmin-radius-lg, 10px);
  box-shadow: var(--antadmin-shadow-card);
}
.c-stat__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--antadmin-radius, 6px);
  font-size: 22px;
  flex: none;
}
.c-stat--primary .c-stat__icon {
  background: var(--antadmin-color-primary-soft);
  color: var(--antadmin-color-primary);
}
.c-stat--accent .c-stat__icon {
  background: var(--antadmin-color-accent-soft);
  color: var(--antadmin-color-accent);
}
.c-stat--success .c-stat__icon {
  background: var(--antadmin-color-success-soft);
  color: var(--antadmin-color-success);
}
.c-stat--warning .c-stat__icon {
  background: var(--antadmin-color-warning-soft);
  color: var(--antadmin-color-warning);
}
.c-stat--error .c-stat__icon {
  background: var(--antadmin-color-error-soft);
  color: var(--antadmin-color-error);
}
.c-stat--info .c-stat__icon {
  background: var(--antadmin-color-info-soft);
  color: var(--antadmin-color-info);
}
.c-stat__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.c-stat__label {
  font-size: 13px;
  color: var(--antadmin-color-text-muted);
}
.c-stat__value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.c-stat__value {
  font-family: var(--antadmin-font-family-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--antadmin-color-text);
  line-height: 1.2;
}
.c-stat__suffix {
  font-size: 13px;
  color: var(--antadmin-color-text-muted);
}
.c-stat__trend {
  font-size: 12px;
  font-weight: 600;
}
.c-stat__trend--up {
  color: var(--antadmin-color-success);
}
.c-stat__trend--down {
  color: var(--antadmin-color-error);
}
</style>
