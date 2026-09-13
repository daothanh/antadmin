<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, toRaw, useAttrs, useSlots, watch } from 'vue'
import type { ComponentPublicInstance, StyleValue } from 'vue'
import { Badge, Input, Table, Tooltip } from 'ant-design-vue'
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import type { FilterValue, SorterResult, TableCurrentDataSource } from 'ant-design-vue/es/table/interface'
import {
  IconDownload,
  IconFilter,
  IconPlus,
  IconReload,
  IconSearch,
  IconSettings,
} from '@tabler/icons-vue'
import { clearTableSettings, getTableSettings, setTableSettings } from '@antadmin/utils'
import type { TableSettings, TableSort } from '@antadmin/utils'
import CButton from './CButton.vue'
import CCard from './CCard.vue'
import CTag from './CTag.vue'
import CTableFilterDrawer from '../internal/CTableFilterDrawer.vue'
import CTableSettingsDrawer from '../internal/CTableSettingsDrawer.vue'
import {
  canControlSort,
  defaultSortOf,
  displayColumnsOf,
  isDefaultTableSettings,
  isSameTableSort,
  mergeSortOrder,
  mergeTableSettings,
  settingColumnsOf,
  sortColumnOf,
  toTableSort,
} from '../internal/column-settings'
import { activeFiltersOf } from '../internal/filter'
import type { TableFilterField, TableFilterValues } from '../internal/filter'
import {
  camelizeKeys,
  columnLabelOf,
  hasColumnKey,
  isPlainObject,
  mergePagination,
  mergeRowClassName,
} from '../internal/table'

// Bảng trang danh sách chuẩn AntAdmin: khung card (tiêu đề + toolbar Thêm mới, Tìm kiếm, Lọc,
// Xuất, Tải lại, Thiết lập), header bảng nền primary, phân trang "Tổng số dòng".
// Có filterFields: nút Lọc mở drawer lọc dựng sẵn, thanh điều kiện lọc hiện ngay trên bảng.
// Nút Thiết lập mở drawer đổi thứ tự/ẩn cột + sắp xếp mặc định; có settingsKey thì nhớ vào localStorage.
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
  /** Nút "Lọc" (sự kiện filter) — có filterFields thì mở drawer lọc dựng sẵn, không thì trang tự mở. */
  showFilter?: boolean
  filterText?: string
  /** Số bộ lọc đang áp dụng (lớn hơn 0 hiện chấm đỏ trên nút Lọc); có filterFields thì tự đếm. */
  filterCount?: number
  /**
   * Trường của drawer lọc dựng sẵn — trang khai báo, như columns. Có giá trị → nút Lọc mở drawer và thanh
   * điều kiện lọc hiện trên bảng; trường type custom render control qua slot #filterField.
   */
  filterFields?: TableFilterField[]
  /** v-model:filterValues — bộ lọc đã áp dụng (không bind thì CTable tự giữ state). */
  filterValues?: TableFilterValues
  /** Nút tròn xuất dữ liệu (sự kiện export). */
  showExport?: boolean
  /** Nút tròn tải lại (sự kiện reload); icon xoay khi bảng loading. */
  showReload?: boolean
  /** Nút tròn thiết lập: drawer đổi thứ tự/ẩn cột và đặt sắp xếp mặc định (cột có `sorter`). */
  showColumnSetting?: boolean
  /**
   * Khoá lưu thiết lập vào localStorage (`antadmin:table:<settingsKey>`) — mỗi bảng một khoá, vd `orders`,
   * `orders:items`. Không truyền thì thiết lập chỉ giữ trong phiên. Truyền cùng khoá cho `useTable({ settingsKey })`
   * để lần tải đầu đã theo sắp xếp mặc định.
   */
  settingsKey?: string
  /** v-model:settings — thiết lập đang áp dụng; bind khi trang tự lưu nơi khác (vd server), không bind thì CTable tự giữ. */
  settings?: TableSettings
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
  filterFields: undefined,
  filterValues: undefined,
  showExport: false,
  showReload: false,
  showColumnSetting: false,
  settingsKey: undefined,
  settings: undefined,
})

const emit = defineEmits<{
  'update:searchValue': [value: string]
  'update:filterValues': [values: TableFilterValues]
  'update:settings': [settings: TableSettings]
  /** Sự kiện change của a-table; CTable cũng phát (action `sort`) khi lưu sắp xếp mặc định mới. */
  change: [
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult | SorterResult[],
    extra: TableCurrentDataSource,
  ]
  search: [value: string]
  create: []
  filter: []
  export: []
  reload: []
}>()

const attrs = useAttrs()
// Ép kiểu tường minh để cắt vòng suy luận slot của vue-tsc (tránh TS7022 khi forward slot động)
const slots: Record<string, unknown> = useSlots()

// Slot CTable tự render (header, drawer lọc) — không forward xuống a-table (tránh hiện trùng).
const OWN_SLOTS = new Set(['title', 'toolbar', 'filterField'])
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

// ── Thiết lập: thứ tự/ẩn cột + sắp xếp mặc định (v-model:settings → localStorage theo settingsKey → gốc) ──
const sourceColumns = computed(() => {
  const { columns } = normalizedAttrs.value
  return Array.isArray(columns) ? (columns as TableColumnsType) : undefined
})
const settingColumns = computed(() => settingColumnsOf(sourceColumns.value ?? []))

function loadSettings(): TableSettings | null {
  if (props.settings !== undefined) return props.settings
  return props.settingsKey ? getTableSettings(props.settingsKey) : null
}
// shallowRef: thiết lập chỉ thay nguyên object (Lưu lại, prop hoặc khoá đổi).
const rawSettings = shallowRef<TableSettings | null>(loadSettings())
watch([() => props.settings, () => props.settingsKey], () => {
  rawSettings.value = loadSettings()
})
// Luôn hợp nhất với columns hiện tại: thiết lập lưu từ bộ cột cũ vẫn áp dụng đúng.
const appliedSettings = computed(() => mergeTableSettings(settingColumns.value, rawSettings.value))

// Thiết lập lưu theo key cột: cột thiếu key/dataIndex dùng key theo vị trí, thêm/bớt cột là áp nhầm sang cột khác —
// dùng sai API, báo ngay khi dựng bảng.
watch(
  [() => props.settingsKey, () => props.settings, sourceColumns],
  ([settingsKey, settings, columns = []]) => {
    if (settingsKey === undefined && settings === undefined) return
    const position = columns.findIndex((column, i) => columnLabelOf(column, i) !== undefined && !hasColumnKey(column))
    const column = columns[position]
    if (column) {
      throw new Error(
        `[@antadmin/ui] CTable: cột "${columnLabelOf(column, position)}" cần \`key\` hoặc \`dataIndex\` để lưu thiết lập (settingsKey/settings).`,
      )
    }
  },
  { immediate: true },
)

// CTable điều khiển sortOrder để chỉ báo sắp xếp khớp sắp xếp mặc định — chỉ khi dùng thiết lập và trang chưa tự
// điều khiển; còn lại a-table tự giữ trạng thái như cũ.
const sortControlled = computed(
  () =>
    (props.showColumnSetting || props.settingsKey !== undefined || props.settings !== undefined) &&
    canControlSort(sourceColumns.value ?? []),
)
// Sắp xếp đang áp dụng: khởi tạo từ sắp xếp mặc định (không có thì defaultSortOrder của cột), đổi theo @change khi
// bấm tiêu đề cột và khi sắp xếp mặc định đổi.
const currentSort = shallowRef<TableSort | null>(
  appliedSettings.value.defaultSort ?? defaultSortOf(sourceColumns.value ?? []),
)
watch(
  () => appliedSettings.value.defaultSort,
  (next, previous) => {
    if (!isSameTableSort(next, previous)) currentSort.value = next
  },
)

// Không có columns (khai báo cột bằng <a-table-column>) → undefined để antdv tự lo.
const displayColumns = computed(() => {
  const columns = sourceColumns.value
  if (!columns) return undefined
  const arranged = displayColumnsOf(columns, appliedSettings.value)
  return sortControlled.value ? mergeSortOrder(arranged, currentSort.value) : arranged
})

const settingsOpen = ref(false)
const settingsButtonRef = ref<HTMLButtonElement | null>(null)
// Filter cột a-table phát ở lần change gần nhất — gửi kèm khi CTable tự phát change.
let columnFilters: Record<string, FilterValue | null> = {}

function onTableChange(
  pagination: TablePaginationConfig,
  filters: Record<string, FilterValue | null>,
  sorter: SorterResult | SorterResult[],
  extra: TableCurrentDataSource,
) {
  columnFilters = filters
  currentSort.value = toTableSort(sorter)
  emit('change', pagination, filters, sorter, extra)
}

// Sắp xếp mặc định mới áp dụng ngay: phát change như khi bấm tiêu đề cột (về trang 1) để useTable.onChange tải lại.
function emitSortChange(sort: TableSort | null) {
  currentSort.value = sort
  const column = sort ? sortColumnOf(sourceColumns.value ?? [], sort) : undefined
  const sorter: SorterResult =
    sort && column
      ? { column, columnKey: column.key, field: 'dataIndex' in column ? column.dataIndex : sort.field, order: sort.order }
      : {}
  const pagination = mergedPagination.value === false ? {} : { ...mergedPagination.value, current: 1 }
  const { dataSource } = normalizedAttrs.value
  emit('change', pagination, columnFilters, sorter, {
    action: 'sort',
    currentDataSource: Array.isArray(dataSource) ? [...dataSource] : [],
  })
}

function saveSettings(next: TableSettings) {
  const settings = mergeTableSettings(settingColumns.value, next)
  const sortChanged = !isSameTableSort(appliedSettings.value.defaultSort, settings.defaultSort)
  if (props.settingsKey) {
    // Trùng cấu hình gốc thì xoá hẳn — cột thêm sau này hiện đúng vị trí khai báo.
    if (isDefaultTableSettings(settings)) clearTableSettings(props.settingsKey)
    else setTableSettings(props.settingsKey, settings)
  }
  rawSettings.value = settings
  emit('update:settings', settings)
  if (sortChanged) emitSortChange(settings.defaultSort)
}

// antdv Drawer không trả focus khi đóng → đưa về nút Thiết lập.
watch(settingsOpen, async (open) => {
  if (open) return
  await nextTick()
  settingsButtonRef.value?.focus()
})

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

// ── Bộ lọc dựng sẵn: drawer + thanh điều kiện (v-model:filterValues, không bind thì tự giữ state) ──
// shallowRef + toRaw: luôn thay cả object, và giá trị phát ra ngoài là object thường (không lọt proxy).
const appliedFilters = shallowRef<TableFilterValues>({ ...toRaw(props.filterValues) })
watch(
  () => props.filterValues,
  (values) => {
    appliedFilters.value = { ...toRaw(values) }
  },
)
const filterOpen = ref(false)
const filterButtonRef = ref<ComponentPublicInstance | null>(null)
const filterListRef = ref<HTMLElement | null>(null)

const activeFilters = computed(() =>
  props.filterFields ? activeFiltersOf(props.filterFields, appliedFilters.value) : [],
)
const activeFilterCount = computed(() =>
  props.filterFields ? activeFilters.value.length : props.filterCount,
)
const filterLabel = computed(() =>
  activeFilterCount.value > 0
    ? `${props.filterText} (đang áp dụng ${activeFilterCount.value} bộ lọc)`
    : props.filterText,
)

// Trường custom mà thiếu slot thì drawer chỉ hiện nhãn trống — dùng sai API, báo ngay khi dựng bảng.
watch(
  () => props.filterFields,
  (fields) => {
    if (fields?.some((field) => field.type === 'custom') && !slots.filterField) {
      throw new Error(
        '[@antadmin/ui] CTable: trường lọc type "custom" cần slot #filterField để render control.',
      )
    }
  },
  { immediate: true },
)

function onFilterClick() {
  emit('filter')
  if (props.filterFields) filterOpen.value = true
}
function updateFilterValues(values: TableFilterValues) {
  appliedFilters.value = values
  emit('update:filterValues', values)
}

function focusFilterButton() {
  const el: unknown = filterButtonRef.value?.$el
  if (el instanceof HTMLElement) el.focus()
}
// Nút ✕ vừa bấm biến mất → đưa focus sang thẻ kế tiếp (hết thẻ thì về nút Lọc), người dùng bàn phím
// không bị rơi về đầu trang.
async function removeFilter(key: string, position: number): Promise<void> {
  updateFilterValues(
    Object.fromEntries(Object.entries(appliedFilters.value).filter(([name]) => name !== key)),
  )
  await nextTick()
  const buttons = filterListRef.value?.querySelectorAll('button') ?? []
  const next = buttons[Math.min(position, buttons.length - 1)]
  if (next) next.focus()
  else focusFilterButton()
}
async function clearFilters(): Promise<void> {
  updateFilterValues({})
  await nextTick()
  focusFilterButton()
}
// antdv Drawer không trả focus khi đóng → đưa về nút Lọc.
watch(filterOpen, async (open) => {
  if (open) return
  await nextTick()
  focusFilterButton()
})

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
          :dot="activeFilterCount > 0"
        >
          <CButton
            ref="filterButtonRef"
            variant="primary"
            :aria-label="filterLabel"
            :aria-haspopup="filterFields ? 'dialog' : undefined"
            @click="onFilterClick"
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
        <!-- Drawer teleport ra body nên click/Enter bên trong không nổi lên toolbar. -->
        <CTableFilterDrawer
          v-if="showFilter && filterFields"
          v-model:open="filterOpen"
          :fields="filterFields"
          :values="appliedFilters"
          @apply="updateFilterValues"
        >
          <template #field="slotProps">
            <slot
              name="filterField"
              v-bind="slotProps"
            />
          </template>
        </CTableFilterDrawer>
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
        <Tooltip
          v-if="showColumnSetting && settingColumns.length"
          title="Thiết lập"
        >
          <button
            ref="settingsButtonRef"
            type="button"
            class="c-table__icon-btn"
            aria-label="Thiết lập bảng"
            aria-haspopup="dialog"
            @click="settingsOpen = true"
          >
            <IconSettings :size="18" />
          </button>
        </Tooltip>
        <!-- Drawer teleport ra body nên click/Enter bên trong không nổi lên toolbar. -->
        <CTableSettingsDrawer
          v-if="showColumnSetting && settingColumns.length"
          v-model:open="settingsOpen"
          :columns="settingColumns"
          :settings="appliedSettings"
          @save="saveSettings"
        />
      </div>
    </template>

    <div
      v-if="activeFilters.length"
      class="c-table__filters"
      role="group"
      aria-label="Điều kiện lọc"
    >
      <span class="c-table__filters-label">
        Đang lọc:
      </span>
      <ul
        ref="filterListRef"
        class="c-table__filter-list"
      >
        <li
          v-for="(condition, position) in activeFilters"
          :key="condition.key"
        >
          <!-- info: đạt tương phản AA ở cả theme sáng lẫn tối. -->
          <CTag
            color="info"
            closable
            :close-text="`Bỏ lọc ${condition.label}: ${condition.text}`"
            :title="`${condition.label}: ${condition.text}`"
            @close="removeFilter(condition.key, position)"
          >
            <span class="c-table__filter-text">
              {{ condition.label }}: <strong>{{ condition.text }}</strong>
            </span>
          </CTag>
        </li>
      </ul>
      <button
        type="button"
        class="c-table__filters-clear"
        @click="clearFilters"
      >
        Xoá tất cả
      </button>
    </div>

    <Table
      v-bind="tableProps"
      :columns="displayColumns"
      :pagination="mergedPagination"
      @change="onTableChange"
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
/* Thanh điều kiện lọc: giữa header và bảng, thẻ tự xuống dòng; chữ dài cắt bằng dấu … (title đủ nội dung). */
.c-table__filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--antadmin-color-border);
}
.c-table__filters-label {
  color: var(--antadmin-color-text-muted);
}
.c-table__filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}
.c-table__filter-list > li {
  max-width: 100%;
}
.c-table__filter-list .c-tag {
  max-width: 100%;
}
.c-table__filter-text {
  min-width: 0;
  overflow: hidden;
  font-weight: 400;
  text-overflow: ellipsis;
}
/* Nút chữ dạng link. */
.c-table__filters-clear {
  margin-inline-start: auto;
  padding: 0;
  font: inherit;
  font-weight: 500;
  color: var(--antadmin-color-link);
  background: none;
  border: none;
  cursor: pointer;
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

/* Nút tròn viền (xuất / tải lại / thiết lập). */
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
.c-table__filters-clear:focus-visible {
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
</style>
