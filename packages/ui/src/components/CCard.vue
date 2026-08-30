<script setup lang="ts">
import { computed, ref } from 'vue'
import { Card, Collapse, CollapsePanel } from 'ant-design-vue'

// Card chuẩn hoá: có chế độ thu gọn (collapse) + biến thể `type`.
// Slot: #title, #actions (extra), default (nội dung).
// LƯU Ý: style của `type` (header navy cho primary...) nằm ở @antadmin/theme/base.css
// (`.c-card-<type>`) vì ant-design-vue 4.x bỏ qua theme.components.
defineOptions({ name: 'CCard', inheritAttrs: false })

const props = withDefaults(defineProps<{
  title?: string
  /** Cho phép thu gọn nội dung. */
  collapsible?: boolean
  /** Trạng thái mở ban đầu khi collapsible. */
  defaultOpen?: boolean
  /** Bỏ viền + bóng. */
  borderless?: boolean
  /** Biến thể: primary (header navy), outline (gạch primary), filled, ghost, default. */
  type?: 'default' | 'primary' | 'outline' | 'filled' | 'ghost'
}>(), {
  title: '',
  collapsible: false,
  defaultOpen: true,
  borderless: true,
  type: 'primary',
})

const rootClass = computed(() => [
  'c-card',
  `c-card-${props.type}`,
  { 'c-card--borderless': props.borderless },
])

const activeKey = ref<string[]>(props.defaultOpen ? ['c-card-panel'] : [])
</script>

<template>
  <Card
    v-if="collapsible"
    :class="[rootClass, 'c-card--collapse']"
    :bordered="false"
    :body-style="{ padding: 0 }"
    v-bind="$attrs"
  >
    <Collapse
      v-model:active-key="activeKey"
      :bordered="false"
      ghost
    >
      <CollapsePanel key="c-card-panel">
        <template #header>
          <slot name="title">
            <span class="c-card__title">{{ title }}</span>
          </slot>
        </template>
        <template
          v-if="$slots.actions"
          #extra
        >
          <slot name="actions" />
        </template>
        <slot />
      </CollapsePanel>
    </Collapse>
  </Card>

  <Card
    v-else
    :class="rootClass"
    :bordered="false"
    v-bind="$attrs"
  >
    <template
      v-if="title || $slots.title"
      #title
    >
      <slot name="title">
        <span class="c-card__title">{{ title }}</span>
      </slot>
    </template>
    <template
      v-if="$slots.actions"
      #extra
    >
      <slot name="actions" />
    </template>
    <slot />
  </Card>
</template>

<style scoped>
.c-card {
  background: var(--antadmin-color-surface);
  border-radius: var(--antadmin-radius-lg, 10px);
}
/* default/outline/filled: có viền; primary tự lo header; ghost trong suốt. */
.c-card-default,
.c-card-outline,
.c-card-filled,
.c-card-primary {
  border: 1px solid var(--antadmin-color-border);
}
.c-card--borderless {
  border: none !important;
  box-shadow: none !important;
}
.c-card__title {
  font-family: var(--antadmin-font-family-heading);
  font-weight: 500;
  font-size: var(--antadmin-card-heading-font-size, 14px);
  color: var(--antadmin-color-text);
}
/* Collapse content bám density (card body để padding 0, Collapse lo phần thân). */
.c-card--collapse :deep(.ant-collapse-content-box) {
  padding: var(--antadmin-card-padding-block, 12px) var(--antadmin-card-padding-inline, 16px);
}
</style>
