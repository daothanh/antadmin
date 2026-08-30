<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import { Form } from 'ant-design-vue'

// Form chuẩn hoá: default layout vertical, có thể override qua attrs.
defineOptions({ name: 'CForm', inheritAttrs: false })

const attrs = useAttrs()
// Ép kiểu tường minh để cắt vòng suy luận slot của vue-tsc (tránh TS7022 khi forward slot động)
const slots: Record<string, unknown> = useSlots()
const slotNames = computed<string[]>(() => Object.keys(slots))
const formProps = computed(() => ({ layout: 'vertical' as const, ...attrs }))
</script>

<template>
  <Form v-bind="formProps">
    <template
      v-for="name in slotNames"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps ?? {}"
      />
    </template>
  </Form>
</template>
