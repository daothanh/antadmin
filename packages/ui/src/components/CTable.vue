<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import { Table } from 'ant-design-vue'

// Bảng chuẩn hoá: default size middle, có thể override qua attrs.
defineOptions({ name: 'CTable', inheritAttrs: false })

const attrs = useAttrs()
// Ép kiểu tường minh để cắt vòng suy luận slot của vue-tsc (tránh TS7022 khi forward slot động)
const slots: Record<string, unknown> = useSlots()
const slotNames = computed<string[]>(() => Object.keys(slots))
const tableProps = computed(() => ({ size: 'middle' as const, ...attrs }))
</script>

<template>
  <Table v-bind="tableProps">
    <template
      v-for="name in slotNames"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps ?? {}"
      />
    </template>
  </Table>
</template>
