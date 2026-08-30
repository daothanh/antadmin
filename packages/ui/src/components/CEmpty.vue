<script setup lang="ts">
import { Empty } from 'ant-design-vue'

// Trạng thái rỗng căn giữa, tuỳ chọn viền nét đứt. Slot #image, #default (actions).
defineOptions({ name: 'CEmpty' })

withDefaults(defineProps<{
  description?: string
  bordered?: boolean
}>(), {
  description: 'Không có dữ liệu',
})
</script>

<template>
  <div
    class="c-empty"
    :class="{ 'c-empty--bordered': bordered }"
  >
    <Empty :description="description">
      <template
        v-if="$slots.image"
        #image
      >
        <slot name="image" />
      </template>
      <slot />
    </Empty>
  </div>
</template>

<style scoped>
.c-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 32px 16px;
  background: var(--antadmin-color-surface);
  border-radius: var(--antadmin-radius, 6px);
}
.c-empty--bordered {
  border: 1px dashed var(--antadmin-color-border);
}
.c-empty :deep(.ant-empty-description) {
  color: var(--antadmin-color-text-subtle);
  font-size: 14px;
  font-weight: 500;
}
</style>
