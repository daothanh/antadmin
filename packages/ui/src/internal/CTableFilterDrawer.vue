<script setup lang="ts">
import { ref, toRaw, useId, watch } from 'vue'
import { DatePicker, Drawer, FormItem, Input, RangePicker, Select } from 'ant-design-vue'
import CButton from '../components/CButton.vue'
import CForm from '../components/CForm.vue'
import { sanitizeFilterValues } from './filter'
import type { TableFilterField, TableFilterSelectField, TableFilterValues } from './filter'

// Drawer lọc dựng sẵn của CTable (nội bộ, không export): dựng form từ `fields`, sửa trên bản nháp và chỉ
// phát `apply` khi bấm Áp dụng — đóng drawer là bỏ nháp. Trường `custom` render control qua slot #field.
// Đặt ngoài components/ để MCP không liệt kê như component public.
defineOptions({ name: 'CTableFilterDrawer' })

const props = withDefaults(defineProps<{
  /** v-model:open */
  open?: boolean
  fields: TableFilterField[]
  /** Bộ lọc đang áp dụng — nháp được chép lại từ đây mỗi lần mở. */
  values?: TableFilterValues
}>(), {
  open: false,
  values: () => ({}),
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  apply: [values: TableFilterValues]
}>()

// Rộng chuẩn trên desktop, không tràn màn hình hẹp.
const DRAWER_WIDTH = 'min(420px, 100vw)'
// Ngày trao đổi dạng chuỗi (gửi query/URL không cần serialize dayjs); hiển thị theo thói quen Việt Nam.
const DATE_VALUE_FORMAT = 'YYYY-MM-DD'
const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY'

type SelectRawValue = string | number

const idPrefix = useId()
const draft = ref<TableFilterValues>({})

watch(
  () => props.open,
  (open) => {
    if (open) draft.value = sanitizeFilterValues(props.values)
  },
  { immediate: true },
)

// id nối label (FormItem không có name nên không tự sinh `for`) với control — đọc màn hình nghe được nhãn.
function idOf(field: TableFilterField): string {
  return `${idPrefix}-${field.key}`
}

function textOf(key: string): string | undefined {
  const value = draft.value[key]
  return typeof value === 'string' ? value : undefined
}

function isSelectRawValue(value: unknown): value is SelectRawValue {
  return typeof value === 'string' || typeof value === 'number'
}

function selectValueOf(field: TableFilterSelectField): SelectRawValue | SelectRawValue[] | undefined {
  const value = draft.value[field.key]
  if (field.multiple) return Array.isArray(value) ? value.filter(isSelectRawValue) : undefined
  return isSelectRawValue(value) ? value : undefined
}

// RangePicker chỉ nhận đủ cả hai đầu; khoảng thiếu một đầu (vd truyền từ URL) hiển thị trống để chọn lại.
function dateRangeOf(key: string): [string, string] | undefined {
  const value = draft.value[key]
  if (!Array.isArray(value)) return undefined
  const [from, to]: unknown[] = value
  return typeof from === 'string' && typeof to === 'string' ? [from, to] : undefined
}

function setValue(key: string, value: unknown) {
  draft.value[key] = value
}

function close() {
  emit('update:open', false)
}

function apply() {
  // toRaw: phát object thường, không để proxy của bản nháp lọt ra ngoài.
  emit('apply', sanitizeFilterValues(toRaw(draft.value)))
  close()
}

// Chỉ xoá nháp — bấm Áp dụng mới lọc (xoá ngay thì dùng "Xoá tất cả" trên thanh điều kiện).
function reset() {
  draft.value = {}
}
</script>

<template>
  <Drawer
    :open="open"
    title="Bộ lọc"
    placement="right"
    :width="DRAWER_WIDTH"
    @close="close"
  >
    <CForm>
      <FormItem
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :html-for="idOf(field)"
      >
        <Input
          v-if="field.type === 'input'"
          :id="idOf(field)"
          :value="textOf(field.key)"
          :placeholder="field.placeholder"
          allow-clear
          @update:value="setValue(field.key, $event)"
          @press-enter="apply"
        />
        <Select
          v-else-if="field.type === 'select'"
          :id="idOf(field)"
          :value="selectValueOf(field)"
          :options="field.options"
          :mode="field.multiple ? 'multiple' : undefined"
          :placeholder="field.placeholder"
          allow-clear
          show-search
          option-filter-prop="label"
          max-tag-count="responsive"
          @update:value="setValue(field.key, $event)"
        />
        <DatePicker
          v-else-if="field.type === 'date'"
          :id="idOf(field)"
          :value="textOf(field.key)"
          :placeholder="field.placeholder"
          :value-format="DATE_VALUE_FORMAT"
          :format="DATE_DISPLAY_FORMAT"
          class="c-table-filter-drawer__control"
          @update:value="setValue(field.key, $event)"
        />
        <RangePicker
          v-else-if="field.type === 'dateRange'"
          :id="idOf(field)"
          :value="dateRangeOf(field.key)"
          :value-format="DATE_VALUE_FORMAT"
          :format="DATE_DISPLAY_FORMAT"
          class="c-table-filter-drawer__control"
          @update:value="setValue(field.key, $event)"
        />
        <slot
          v-else
          name="field"
          :field="field"
          :values="draft"
        />
      </FormItem>
    </CForm>

    <template #footer>
      <div class="c-table-filter-drawer__footer">
        <CButton
          variant="outline"
          block
          @click="reset"
        >
          Đặt lại
        </CButton>
        <CButton
          variant="primary"
          block
          @click="apply"
        >
          Áp dụng
        </CButton>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
/* DatePicker/RangePicker mặc định rộng theo nội dung — cho bằng các control khác trong form. */
.c-table-filter-drawer__control {
  width: 100%;
}
/* Hai nút chia đôi — cùng kiểu footer drawer Thiết lập của CTable. */
.c-table-filter-drawer__footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
