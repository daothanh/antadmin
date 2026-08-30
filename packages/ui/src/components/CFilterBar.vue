<script setup lang="ts">
import { Input } from 'ant-design-vue'
import CButton from './CButton.vue'

// Thanh lọc/tìm kiếm chuẩn cho trang danh sách — đặt trên <CTable> (pattern useTable).
// ROUTER-AGNOSTIC & không tự fetch: phát `@search` (kèm text tìm kiếm) và `@reset`
// để trang tự gọi useTable.reload()/onChange. Slot mặc định để cắm control lọc
// tuỳ ý (CSelect, CDatePicker…); slot #actions cho nút phụ bên phải.
defineOptions({ name: 'CFilterBar', inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** v-model:searchValue — text ô tìm kiếm. */
  searchValue?: string
  searchPlaceholder?: string
  showSearch?: boolean
  showReset?: boolean
  loading?: boolean
}>(), {
  searchValue: '',
  searchPlaceholder: 'Tìm kiếm…',
  showSearch: true,
  showReset: true,
  loading: false,
})

const emit = defineEmits<{
  'update:searchValue': [v: string]
  search: [value: string]
  reset: []
}>()

// antd Input phát `change` cả khi gõ lẫn khi bấm nút xoá (allow-clear).
function onSearchChange(e: Event) {
  emit('update:searchValue', (e.target as HTMLInputElement).value)
}
function onSearch() {
  emit('search', props.searchValue)
}
function onReset() {
  emit('update:searchValue', '')
  emit('reset')
}
</script>

<template>
  <div class="c-filter-bar">
    <div
      v-if="$slots.default"
      class="c-filter-bar__filters"
    >
      <slot />
    </div>

    <div class="c-filter-bar__actions">
      <Input
        v-if="showSearch"
        :value="searchValue"
        :placeholder="searchPlaceholder"
        allow-clear
        class="c-filter-bar__search"
        @change="onSearchChange"
        @press-enter="onSearch"
      />
      <CButton
        variant="primary"
        :loading="loading"
        @click="onSearch"
      >
        Lọc
      </CButton>
      <CButton
        v-if="showReset"
        variant="outline"
        @click="onReset"
      >
        Xoá lọc
      </CButton>
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.c-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: var(--antadmin-color-surface);
  border: 1px solid var(--antadmin-color-border);
  border-radius: var(--antadmin-radius, 6px);
}
.c-filter-bar__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}
.c-filter-bar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}
.c-filter-bar__search {
  width: 220px;
  max-width: 100%;
}
</style>
