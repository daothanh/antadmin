<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { Drawer, FormItem, RadioGroup, Segmented, Select, Switch } from 'ant-design-vue'
import { IconArrowDown, IconArrowUp, IconGripVertical } from '@tabler/icons-vue'
import { isTableSortOrder } from '@antadmin/utils'
import type { TableSettings, TableSortOrder } from '@antadmin/utils'
import CButton from '../components/CButton.vue'
import CForm from '../components/CForm.vue'
import { mergeColumnOrder, mergeTableSettings, moveColumn } from './column-settings'
import type { SettingColumn } from './column-settings'

// Drawer thiết lập của CTable (nội bộ, không export): tab "Hiển thị cột" đổi thứ tự (kéo thả hoặc nút ↑↓) và
// ẩn/hiện cột, tab "Khác" đặt sắp xếp mặc định. Sửa trên bản nháp, chỉ phát `save` khi bấm Lưu lại — đóng drawer là
// bỏ nháp. Đặt ngoài components/ để MCP không liệt kê như component public.
defineOptions({ name: 'CTableSettingsDrawer' })

const props = withDefaults(defineProps<{
  /** v-model:open */
  open?: boolean
  /** Cột cấu hình được, theo thứ tự khai báo trong columns. */
  columns: SettingColumn[]
  /** Thiết lập đang áp dụng — nháp được chép lại từ đây mỗi lần mở. */
  settings: TableSettings
}>(), {
  open: false,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [settings: TableSettings]
}>()

type SettingsTab = 'columns' | 'other'
type MoveDirection = 'up' | 'down'

// Cùng độ rộng drawer lọc: chuẩn trên desktop, không tràn màn hình hẹp.
const DRAWER_WIDTH = 'min(420px, 100vw)'
const TAB_OPTIONS = [
  { label: 'Hiển thị cột', value: 'columns' },
  { label: 'Khác', value: 'other' },
]
const SORT_ORDER_OPTIONS = [
  { label: 'Tăng dần', value: 'ascend' },
  { label: 'Giảm dần', value: 'descend' },
]

const idPrefix = useId()
const tab = ref<SettingsTab>('columns')
const order = ref<string[]>([])
const hiddenColumns = ref<string[]>([])
const sortEnabled = ref(false)
const sortField = ref<string>()
const sortOrder = ref<TableSortOrder>('ascend')
const draggingKey = ref<string | null>(null)
const announcement = ref('')
// Nút ↑/↓ theo `<key>:<hướng>` — Vue dời DOM của dòng khi đổi thứ tự làm mất focus, cần trả lại.
const moveButtons = new Map<string, HTMLButtonElement>()

const columnsByKey = computed(() => new Map(props.columns.map((column) => [column.key, column])))
const rows = computed(() =>
  order.value.flatMap((key) => {
    const column = columnsByKey.value.get(key)
    return column ? [column] : []
  }),
)
const visibleCount = computed(() => rows.value.filter((row) => !isHidden(row.key)).length)
const sortOptions = computed(() =>
  props.columns.flatMap((column) =>
    column.sortField === null ? [] : [{ label: column.label, value: column.sortField }],
  ),
)

function loadDraft(settings: TableSettings) {
  order.value = mergeColumnOrder(props.columns, settings.columnOrder)
  hiddenColumns.value = [...settings.hiddenColumns]
  sortEnabled.value = settings.defaultSort !== null
  sortField.value = settings.defaultSort?.field
  sortOrder.value = settings.defaultSort?.order ?? 'ascend'
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    tab.value = 'columns'
    announcement.value = ''
    loadDraft(props.settings)
  },
  { immediate: true },
)

function onTabChange(value: string | number) {
  tab.value = value === 'other' ? 'other' : 'columns'
}

function isHidden(key: string): boolean {
  return hiddenColumns.value.includes(key)
}

function setVisible(key: string, visible: boolean) {
  const others = hiddenColumns.value.filter((item) => item !== key)
  hiddenColumns.value = visible ? others : [...others, key]
}

// Thứ tự luôn xếp theo nhóm cố định → còn cột kề cùng nhóm nghĩa là chưa ở mép nhóm.
function canMove(index: number, direction: MoveDirection): boolean {
  const row = rows.value[index]
  const neighbor = rows.value[direction === 'up' ? index - 1 : index + 1]
  return row !== undefined && neighbor !== undefined && neighbor.pin === row.pin
}

function announce(key: string) {
  const label = columnsByKey.value.get(key)?.label ?? key
  announcement.value = `Đã chuyển ${label} tới vị trí ${order.value.indexOf(key) + 1}/${order.value.length}`
}

function bindMoveButton(key: string, direction: MoveDirection, el: Element | ComponentPublicInstance | null) {
  const id = `${key}:${direction}`
  if (el instanceof HTMLButtonElement) moveButtons.set(id, el)
  else moveButtons.delete(id)
}

async function move(key: string, direction: MoveDirection): Promise<void> {
  const from = order.value.indexOf(key)
  order.value = moveColumn(order.value, key, direction === 'up' ? from - 1 : from + 1, props.columns)
  announce(key)
  await nextTick()
  // Dòng vừa tới mép nhóm thì nút đã bấm bị tắt → focus sang nút còn lại của dòng.
  const target = canMove(order.value.indexOf(key), direction) ? direction : direction === 'up' ? 'down' : 'up'
  moveButtons.get(`${key}:${target}`)?.focus()
}

// ── Kéo thả (HTML5): kéo tay nắm, dòng đổi chỗ ngay khi đi qua dòng khác; bàn phím/cảm ứng dùng nút ↑↓ ──
function onDragStart(event: DragEvent, key: string) {
  draggingKey.value = key
  const { dataTransfer, currentTarget } = event
  if (!dataTransfer) return
  dataTransfer.effectAllowed = 'move'
  // Firefox chỉ bắt đầu kéo khi có dữ liệu.
  dataTransfer.setData('text/plain', key)
  // Kéo từ tay nắm nhưng ảnh kéo là cả dòng.
  const row = currentTarget instanceof HTMLElement ? currentTarget.closest('li') : null
  if (row) dataTransfer.setDragImage(row, 16, row.offsetHeight / 2)
}

function onDragEnter(key: string) {
  const dragging = draggingKey.value
  if (dragging === null || dragging === key) return
  order.value = moveColumn(order.value, dragging, order.value.indexOf(key), props.columns)
}

function onDragOver(event: DragEvent) {
  // Chỉ nhận dòng của danh sách này — kéo file/chữ từ ngoài vào không đổi con trỏ thành "thả được".
  if (draggingKey.value === null) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDragEnd() {
  const key = draggingKey.value
  draggingKey.value = null
  if (key !== null) announce(key)
}

// ── Sắp xếp mặc định ──
function setSortEnabled(enabled: boolean) {
  sortEnabled.value = enabled
  // Bật mà chưa chọn cột (hoặc cột đã chọn không còn) → chọn sẵn cột đầu tiên, không có trạng thái thiếu cột.
  if (enabled && !sortOptions.value.some((option) => option.value === sortField.value)) {
    sortField.value = sortOptions.value[0]?.value
  }
}

function onSortFieldChange(value: unknown) {
  if (typeof value === 'string') sortField.value = value
}

function onSortOrderChange(value: unknown) {
  if (isTableSortOrder(value)) sortOrder.value = value
}

function close() {
  emit('update:open', false)
}

function save() {
  emit('save', {
    columnOrder: [...order.value],
    hiddenColumns: [...hiddenColumns.value],
    defaultSort:
      sortEnabled.value && sortField.value !== undefined
        ? { field: sortField.value, order: sortOrder.value }
        : null,
  })
  close()
}

// Chỉ đưa nháp về cấu hình gốc — bấm Lưu lại mới áp dụng (và xoá thiết lập đã lưu).
function reset() {
  loadDraft(mergeTableSettings(props.columns, null))
}
</script>

<template>
  <Drawer
    :open="open"
    title="Thiết lập"
    placement="right"
    :width="DRAWER_WIDTH"
    @close="close"
  >
    <Segmented
      v-if="sortOptions.length"
      :value="tab"
      :options="TAB_OPTIONS"
      block
      class="c-table-settings-drawer__tabs"
      @update:value="onTabChange"
    />

    <ul
      v-show="tab === 'columns'"
      class="c-table-settings-drawer__columns"
      aria-label="Thứ tự và hiển thị cột"
    >
      <li
        v-for="(row, index) in rows"
        :key="row.key"
        class="c-table-settings-drawer__column"
        :class="{ 'c-table-settings-drawer__column--dragging': draggingKey === row.key }"
        @dragenter="onDragEnter(row.key)"
        @dragover="onDragOver"
        @drop.prevent
      >
        <!-- Chỉ dành cho chuột; bàn phím và cảm ứng dùng nút ↑↓ nên ẩn khỏi trình đọc màn hình. -->
        <span
          class="c-table-settings-drawer__handle"
          draggable="true"
          aria-hidden="true"
          @dragstart="onDragStart($event, row.key)"
          @dragend="onDragEnd"
        >
          <IconGripVertical :size="16" />
        </span>
        <span
          class="c-table-settings-drawer__label"
          :title="row.label"
        >
          {{ row.label }}
        </span>
        <button
          :ref="(el) => bindMoveButton(row.key, 'up', el)"
          type="button"
          class="c-table-settings-drawer__move"
          :aria-label="`Chuyển ${row.label} lên`"
          :disabled="!canMove(index, 'up')"
          @click="move(row.key, 'up')"
        >
          <IconArrowUp :size="16" />
        </button>
        <button
          :ref="(el) => bindMoveButton(row.key, 'down', el)"
          type="button"
          class="c-table-settings-drawer__move"
          :aria-label="`Chuyển ${row.label} xuống`"
          :disabled="!canMove(index, 'down')"
          @click="move(row.key, 'down')"
        >
          <IconArrowDown :size="16" />
        </button>
        <!-- Không cho ẩn cột cuối cùng đang hiện. -->
        <Switch
          :checked="!isHidden(row.key)"
          :disabled="!isHidden(row.key) && visibleCount <= 1"
          checked-children="Hiện"
          un-checked-children="Ẩn"
          :aria-label="`Hiện cột ${row.label}`"
          @update:checked="(checked) => setVisible(row.key, checked === true)"
        />
      </li>
    </ul>

    <CForm v-show="tab === 'other'">
      <div class="c-table-settings-drawer__toggle">
        <div>
          <label
            :for="`${idPrefix}-sort`"
            class="c-table-settings-drawer__toggle-label"
          >
            Sắp xếp mặc định
          </label>
          <p
            :id="`${idPrefix}-sort-hint`"
            class="c-table-settings-drawer__hint"
          >
            Bật/tắt và chọn cột, chiều sắp xếp
          </p>
        </div>
        <Switch
          :id="`${idPrefix}-sort`"
          :checked="sortEnabled"
          checked-children="Bật"
          un-checked-children="Tắt"
          :aria-describedby="`${idPrefix}-sort-hint`"
          @update:checked="(checked) => setSortEnabled(checked === true)"
        />
      </div>
      <FormItem
        label="Cột sắp xếp"
        :html-for="`${idPrefix}-sort-field`"
      >
        <Select
          :id="`${idPrefix}-sort-field`"
          :value="sortField"
          :options="sortOptions"
          :disabled="!sortEnabled"
          placeholder="Chọn cột"
          show-search
          option-filter-prop="label"
          @update:value="onSortFieldChange"
        />
      </FormItem>
      <FormItem label="Chiều sắp xếp">
        <RadioGroup
          :value="sortOrder"
          :options="SORT_ORDER_OPTIONS"
          :disabled="!sortEnabled"
          option-type="button"
          button-style="solid"
          role="radiogroup"
          aria-label="Chiều sắp xếp"
          @update:value="onSortOrderChange"
        />
      </FormItem>
    </CForm>

    <p
      class="c-table-settings-drawer__sr-only"
      aria-live="polite"
    >
      {{ announcement }}
    </p>

    <template #footer>
      <div class="c-table-settings-drawer__footer">
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
          @click="save"
        >
          Lưu lại
        </CButton>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
.c-table-settings-drawer__tabs {
  margin-bottom: 16px;
}
/* Tab đang chọn cùng nền nút chính (Segmented mặc định chỉ nổi nền trắng, khó nhận ra); gradient primary giữ chữ trắng
 * đạt tương phản AA ở cả theme sáng lẫn tối (--antadmin-color-primary ở theme tối quá sáng cho chữ trắng). */
.c-table-settings-drawer__tabs :deep(.ant-segmented-item-selected),
.c-table-settings-drawer__tabs :deep(.ant-segmented-thumb) {
  color: #fff;
  background: var(--antadmin-gradient-primary);
}

.c-table-settings-drawer__columns {
  margin: 0;
  padding: 0;
  list-style: none;
}
.c-table-settings-drawer__column {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--antadmin-color-border);
  /* Cùng nền drawer — ảnh kéo (setDragImage) của dòng không bị trong suốt. */
  background: var(--antadmin-color-surface-elevated);
}
.c-table-settings-drawer__column--dragging {
  opacity: 0.5;
}
.c-table-settings-drawer__handle {
  display: inline-flex;
  flex: none;
  color: var(--antadmin-color-text-subtle);
  cursor: grab;
}
.c-table-settings-drawer__handle:active {
  cursor: grabbing;
}
.c-table-settings-drawer__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Nút tròn viền ↑↓ — cùng kiểu nút tròn trên toolbar, nhỏ hơn. */
.c-table-settings-drawer__move {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--antadmin-control-height-sm, 28px);
  height: var(--antadmin-control-height-sm, 28px);
  padding: 0;
  color: var(--antadmin-color-text);
  background: var(--antadmin-color-surface);
  border: 1px solid var(--antadmin-color-border-strong);
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.c-table-settings-drawer__move:hover:not(:disabled) {
  color: var(--antadmin-color-primary);
  border-color: var(--antadmin-color-primary);
}
.c-table-settings-drawer__move:focus-visible {
  outline: 2px solid var(--antadmin-color-primary);
  outline-offset: 2px;
}
.c-table-settings-drawer__move:disabled {
  color: var(--antadmin-color-text-subtle);
  border-color: var(--antadmin-color-border);
  cursor: not-allowed;
}

.c-table-settings-drawer__toggle {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: var(--antadmin-form-item-margin, 16px);
}
.c-table-settings-drawer__toggle-label {
  font-weight: 500;
}
.c-table-settings-drawer__hint {
  margin: 2px 0 0;
  color: var(--antadmin-color-text-muted);
}

.c-table-settings-drawer__footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.c-table-settings-drawer__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
