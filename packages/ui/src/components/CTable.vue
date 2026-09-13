<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, watch } from 'vue'
import type { StyleValue } from 'vue'
import { Badge, Checkbox, Input, Popover, Table, Tooltip } from 'ant-design-vue'
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import {
  IconDownload,
  IconFilter,
  IconPlus,
  IconReload,
  IconSearch,
  IconSettings,
} from '@tabler/icons-vue'
import CButton from './CButton.vue'
import CCard from './CCard.vue'
import {
  camelizeKeys,
  columnKeyOf,
  columnLabelOf,
  isPlainObject,
  mergePagination,
  mergeRowClassName,
  visibleColumns,
} from '../internal/table'

// Bảng trang danh sách chuẩn AntAdmin: khung card (tiêu đề + toolbar Thêm mới, Tìm kiếm, Lọc,
// Xuất, Tải lại, Cài đặt cột), header bảng nền primary, phân trang "Tổng số dòng".
// Cột do trang định nghĩa; mọi prop/slot/sự kiện khác của a-table (columns, dataSource, loading,
// pagination, bodyCell, @change…) được forward nguyên vẹn — bind thẳng với useTable như trước.
defineOptions({ name: 'CTable', inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Tiêu đề ở header khung (bên trái); slot #title để tuỳ biến. */
  title?: string
  /** Cho phép thu gọn bảng. */
  collapsible?: boolean
  /** Trạng thái mở ban đầu khi collapsible. */
  defaultOpen?: boolean
  /** Bỏ viền + bóng của khung. */
  borderless?: boolean
  /** Biến thể khung (xem CCard); `default` là header trắng — chuẩn trang danh sách. */
  type?: 'default' | 'primary' | 'outline' | 'filled' | 'ghost'
  /** Nền xen kẽ giữa các dòng. */
  striped?: boolean
  /** Nút "Thêm mới" (sự kiện create). */
  showCreate?: boolean
  createText?: string
  /** Ô tìm kiếm: v-model:searchValue, sự kiện search khi Enter hoặc bấm xoá. */
  showSearch?: boolean
  searchValue?: string
  searchPlaceholder?: string
  /** Nút "Lọc" (sự kiện filter) — trang tự mở drawer/panel lọc. */
  showFilter?: boolean
  filterText?: string
  /** Số bộ lọc đang áp dụng; lớn hơn 0 thì hiện chấm đỏ trên nút Lọc. */
  filterCount?: number
  /** Nút tròn xuất dữ liệu (sự kiện export). */
  showExport?: boolean
  /** Nút tròn tải lại (sự kiện reload); icon xoay khi bảng loading. */
  showReload?: boolean
  /** Nút tròn cài đặt cột: popover ẩn/hiện cột. */
  showColumnSetting?: boolean
  /** v-model:hiddenColumns — key các cột đang ẩn (key, không có thì dataIndex). */
  hiddenColumns?: string[]
}>(), {
  title: '',
  collapsible: false,
  defaultOpen: true,
  borderless: false,
  type: 'default',
  striped: false,
  showCreate: false,
  createText: 'Thêm mới',
  showSearch: false,
  searchValue: '',
  searchPlaceholder: 'Tìm kiếm...',
  showFilter: false,
  filterText: 'Lọc',
  filterCount: 0,
  showExport: false,
  showReload: false,
  showColumnSetting: false,
  hiddenColumns: undefined,
})

const emit = defineEmits<{
  'update:searchValue': [value: string]
  'update:hiddenColumns': [keys: string[]]
  search: [value: string]
  create: []
  filter: []
  export: []
  reload: []
}>()

const attrs = useAttrs()
// Ép kiểu tường minh để cắt vòng suy luận slot của vue-tsc (tránh TS7022 khi forward slot động)
const slots: Record<string, unknown> = useSlots()

// Slot CTable tự render ở header — không forward xuống a-table (tránh hiện trùng).
const OWN_SLOTS = new Set(['title', 'toolbar'])
// Attr CTable tự xử lý (gắn khung ngoài hoặc gộp cấu hình) trước khi chuyển cho a-table.
const OWN_ATTRS = new Set(['class', 'style', 'columns', 'pagination', 'rowClassName'])

const normalizedAttrs = computed<Record<string, unknown>>(() => {
  // Proxy attrs chỉ track khi đọc key (không track ownKeys) → đọc `class` để luôn cập nhật.
  const cls = attrs.class
  return { ...camelizeKeys(attrs), class: cls }
})

const rootClass = computed(() => [
  'c-table',
  { 'c-table--striped': props.striped },
  normalizedAttrs.value.class,
])
const rootStyle = computed(() => normalizedAttrs.value.style as StyleValue)

const tableProps = computed(() => {
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(normalizedAttrs.value)) {
    if (!OWN_ATTRS.has(key)) rest[key] = value
  }
  const { rowClassName } = normalizedAttrs.value
  return {
    size: 'middle' as const,
    ...rest,
    ...(props.striped || rowClassName !== undefined
      ? { rowClassName: mergeRowClassName(rowClassName, props.striped) }
      : {}),
  }
})

const mergedPagination = computed(
  () => mergePagination(normalizedAttrs.value.pagination) as false | TablePaginationConfig,
)

// ── Ẩn/hiện cột (v-model:hiddenColumns, không bind thì tự giữ state) ─────────────────────
const sourceColumns = computed(() => {
  const { columns } = normalizedAttrs.value
  return Array.isArray(columns) ? (columns as TableColumnsType) : undefined
})
const hiddenKeys = ref<string[]>([...(props.hiddenColumns ?? [])])
watch(
  () => props.hiddenColumns,
  (keys) => {
    hiddenKeys.value = [...(keys ?? [])]
  },
)

// Không có columns (khai báo cột bằng <a-table-column>) → undefined để antdv tự lo.
const displayColumns = computed(() =>
  sourceColumns.value ? visibleColumns(sourceColumns.value, hiddenKeys.value) : undefined,
)
const settingColumns = computed(() =>
  (sourceColumns.value ?? []).flatMap((column, i) => {
    const label = columnLabelOf(column, i)
    return label === undefined ? [] : [{ key: columnKeyOf(column, i), label }]
  }),
)
const visibleColumnCount = computed(
  () => settingColumns.value.filter((column) => !hiddenKeys.value.includes(column.key)).length,
)

function isColumnHidden(key: string): boolean {
  return hiddenKeys.value.includes(key)
}
function updateHiddenColumns(keys: string[]) {
  hiddenKeys.value = keys
  emit('update:hiddenColumns', keys)
}
function setColumnVisible(key: string, visible: boolean) {
  const others = hiddenKeys.value.filter((k) => k !== key)
  updateHiddenColumns(visible ? others : [...others, key])
}

// ── Toolbar ──────────────────────────────────────────────────────────────────────────────
const searchText = ref(props.searchValue)
watch(
  () => props.searchValue,
  (value) => {
    searchText.value = value
  },
)

function onSearchChange(event: Event) {
  const value = (event.target as HTMLInputElement | null)?.value ?? ''
  searchText.value = value
  emit('update:searchValue', value)
  // Nút xoá (allow-clear) của antdv phát change kiểu click → tìm lại ngay với chuỗi rỗng.
  if (event.type === 'click' && value === '') emit('search', '')
}
function onSearch() {
  emit('search', searchText.value)
}

const filterLabel = computed(() =>
  props.filterCount > 0
    ? `${props.filterText} (đang áp dụng ${props.filterCount} bộ lọc)`
    : props.filterText,
)

const isLoading = computed(() => {
  const { loading } = normalizedAttrs.value
  return loading === true || loading === '' || (isPlainObject(loading) && loading.spinning !== false)
})

// Slot đọc trực tiếp lúc render (useSlots không reactive — computed sẽ giữ giá trị cũ).
function forwardedSlotNames(): string[] {
  return Object.keys(slots).filter((name) => !OWN_SLOTS.has(name))
}
function hasToolbar(): boolean {
  return (
    Boolean(slots.toolbar) ||
    props.showCreate ||
    props.showSearch ||
    props.showFilter ||
    props.showExport ||
    props.showReload ||
    props.showColumnSetting
  )
}

// Toolbar nằm trong header Collapse khi collapsible — chặn click/Enter nổi lên để khỏi thu gọn nhầm.
function stopInCollapse(event: Event) {
  if (props.collapsible) event.stopPropagation()
}
</script>

<template>
  <CCard
    :class="rootClass"
    :style="rootStyle"
    :title="title"
    :collapsible="collapsible"
    :default-open="defaultOpen"
    :borderless="borderless"
    :type="type"
    :body-style="{ padding: 0 }"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template
      v-if="hasToolbar()"
      #actions
    >
      <div
        class="c-table__toolbar"
        @click="stopInCollapse"
        @keypress="stopInCollapse"
      >
        <slot name="toolbar" />
        <CButton
          v-if="showCreate"
          variant="primary"
          @click="emit('create')"
        >
          <template #icon>
            <IconPlus
              class="c-table__btn-icon"
              :size="16"
            />
          </template>
          {{ createText }}
        </CButton>
        <Input
          v-if="showSearch"
          :value="searchText"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          allow-clear
          class="c-table__search"
          @change="onSearchChange"
          @press-enter="onSearch"
        >
          <template #prefix>
            <IconSearch
              class="c-table__search-icon"
              :size="16"
            />
          </template>
        </Input>
        <Badge
          v-if="showFilter"
          :dot="filterCount > 0"
        >
          <CButton
            variant="primary"
            :aria-label="filterLabel"
            @click="emit('filter')"
          >
            <template #icon>
              <IconFilter
                class="c-table__btn-icon"
                :size="16"
              />
            </template>
            {{ filterText }}
          </CButton>
        </Badge>
        <Tooltip
          v-if="showExport"
          title="Xuất dữ liệu"
        >
          <button
            type="button"
            class="c-table__icon-btn"
            aria-label="Xuất dữ liệu"
            @click="emit('export')"
          >
            <IconDownload :size="18" />
          </button>
        </Tooltip>
        <Tooltip
          v-if="showReload"
          title="Tải lại"
        >
          <button
            type="button"
            class="c-table__icon-btn"
            aria-label="Tải lại"
            :aria-busy="isLoading"
            @click="emit('reload')"
          >
            <IconReload
              :class="{ 'c-table__spin': isLoading }"
              :size="18"
            />
          </button>
        </Tooltip>
        <Popover
          v-if="showColumnSetting"
          trigger="click"
          placement="bottomRight"
        >
          <template #title>
            <div class="c-table__settings-head">
              <span>Hiển thị cột</span>
              <button
                type="button"
                class="c-table__settings-reset"
                :disabled="hiddenKeys.length === 0"
                @click="updateHiddenColumns([])"
              >
                Đặt lại
              </button>
            </div>
          </template>
          <template #content>
            <ul class="c-table__settings">
              <li
                v-for="column in settingColumns"
                :key="column.key"
              >
                <Checkbox
                  :checked="!isColumnHidden(column.key)"
                  :disabled="!isColumnHidden(column.key) && visibleColumnCount <= 1"
                  @change="setColumnVisible(column.key, $event.target.checked)"
                >
                  {{ column.label }}
                </Checkbox>
              </li>
            </ul>
          </template>
          <!-- span làm neo nhận click cho Popover (Tooltip lồng trực tiếp không nhận được). -->
          <span class="c-table__anchor">
            <Tooltip title="Cài đặt cột">
              <button
                type="button"
                class="c-table__icon-btn"
                aria-label="Cài đặt cột"
              >
                <IconSettings :size="18" />
              </button>
            </Tooltip>
          </span>
        </Popover>
      </div>
    </template>

    <Table
      v-bind="tableProps"
      :columns="displayColumns"
      :pagination="mergedPagination"
    >
      <template
        v-for="name in forwardedSlotNames()"
        #[name]="slotProps"
      >
        <slot
          :name="name"
          v-bind="slotProps ?? {}"
        />
      </template>
    </Table>
  </CCard>
</template>

<style scoped>
/* Header khung: đủ cao cho control, toolbar tự xuống dòng khi màn hình hẹp. */
.c-table :deep(.ant-card-head) {
  padding-block: 10px;
}
.c-table :deep(.ant-card-head-wrapper) {
  flex-wrap: wrap;
  gap: 8px 16px;
}
.c-table :deep(.ant-card-head-title) {
  flex: 1 1 200px;
}
.c-table :deep(.ant-card-extra) {
  margin-inline-start: auto;
}
/* Chế độ thu gọn: header Collapse không khoá chiều cao; thân bảng sát mép. */
.c-table.c-card--collapse :deep(.ant-collapse-header) {
  height: auto !important;
  min-height: var(--antadmin-card-heading-height, 36px);
  padding-block: 10px !important;
  flex-wrap: wrap;
  row-gap: 8px;
}
.c-table.c-card--collapse :deep(.ant-collapse-content > .ant-collapse-content-box) {
  padding: 0;
}

/* Bảng sát mép khung (khung đã có viền); phân trang cách mép. */
.c-table :deep(.ant-table) {
  border-radius: 0;
}
.c-table :deep(.ant-table-pagination.ant-pagination) {
  margin: 12px 16px;
  row-gap: 8px;
}
/* Dòng xen kẽ — nhường nền cho hover/selected của antdv. */
.c-table--striped :deep(.ant-table-tbody > tr.c-table__row--striped:not(:hover):not(.ant-table-row-selected) > td) {
  background: var(--antadmin-color-surface-muted);
}

.c-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}
.c-table__search {
  width: 240px;
  max-width: 100%;
}
.c-table__search-icon {
  color: var(--antadmin-color-text-subtle);
}
/* Icon trong CButton (antdv chỉ tự chừa khoảng cho .anticon). */
.c-table__btn-icon {
  margin-inline-end: 6px;
  vertical-align: -3px;
}
.c-table__anchor {
  display: inline-flex;
}

/* Nút tròn viền (xuất / tải lại / cài đặt cột). */
.c-table__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--antadmin-control-height, 36px);
  height: var(--antadmin-control-height, 36px);
  padding: 0;
  color: var(--antadmin-color-text);
  background: var(--antadmin-color-surface);
  border: 1px solid var(--antadmin-color-border-strong);
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.c-table__icon-btn:hover {
  color: var(--antadmin-color-primary);
  border-color: var(--antadmin-color-primary);
}
.c-table__icon-btn:focus-visible,
.c-table__settings-reset:focus-visible {
  outline: 2px solid var(--antadmin-color-primary);
  outline-offset: 2px;
}

.c-table__spin {
  animation: c-table-spin 0.8s linear infinite;
}
@keyframes c-table-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Popover cài đặt cột. */
.c-table__settings-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.c-table__settings-reset {
  padding: 0;
  font: inherit;
  font-weight: 500;
  color: var(--antadmin-color-link);
  background: none;
  border: none;
  cursor: pointer;
}
.c-table__settings-reset:disabled {
  color: var(--antadmin-color-text-subtle);
  cursor: not-allowed;
}
.c-table__settings {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  max-height: 320px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}
</style>
