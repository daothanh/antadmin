// Lõi thuần cho thiết lập bảng của CTable: cột nào cấu hình được, hợp nhất thiết lập đã lưu với `columns` hiện tại,
// xếp lại/ẩn cột, điều khiển `sortOrder` theo sắp xếp mặc định. Tách khỏi SFC để test trực tiếp; không phụ thuộc
// ant-design-vue.
import { isTableSortOrder } from '@antadmin/utils'
import type { TableSettings, TableSort } from '@antadmin/utils'
import { columnKeyOf, columnLabelOf, isPlainObject } from './table'
import type { TableColumnLike } from './table'

/** Nhóm cố định của cột — antdv cần các cột `fixed` nằm liền nhau ở mép bảng, nên chỉ đổi thứ tự trong nhóm. */
export type ColumnPin = 'left' | 'none' | 'right'

/** Một cột trong drawer thiết lập. */
export interface SettingColumn {
  key: string
  label: string
  pin: ColumnPin
  /** Field khi chọn cột làm sắp xếp mặc định; cột không sắp xếp được → null. */
  sortField: string | null
}

const PIN_ORDER: readonly ColumnPin[] = ['left', 'none', 'right']

export function pinOf(column: TableColumnLike): ColumnPin {
  if (column.fixed === 'right') return 'right'
  return column.fixed === 'left' || column.fixed === true ? 'left' : 'none'
}

/** `field` của sorter a-table là dataIndex: chuỗi/số dùng được; mảng hoặc rỗng không lưu thành một field được. */
function toSortField(value: unknown): string | null {
  if (typeof value === 'number') return String(value)
  return typeof value === 'string' && value !== '' ? value : null
}

/** Field sắp xếp của cột — cột có `sorter` và `dataIndex` chuỗi/số; còn lại → null. */
export function sortFieldOf(column: TableColumnLike): string | null {
  return column.sorter ? toSortField(column.dataIndex) : null
}

/** Cột cấu hình được (bỏ cột tiện ích `title: ''`), theo thứ tự khai báo trong `columns`. */
export function settingColumnsOf(columns: readonly TableColumnLike[]): SettingColumn[] {
  return columns.flatMap((column, i) => {
    const label = columnLabelOf(column, i)
    return label === undefined
      ? []
      : [{ key: columnKeyOf(column, i), label, pin: pinOf(column), sortField: sortFieldOf(column) }]
  })
}

function isSameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((item, i) => item === b[i])
}

/**
 * Thứ tự đầy đủ key cột cấu hình được: theo `order` đã lưu (bỏ key không còn), cột mới chèn ngay sau cột đứng trước
 * nó trong `columns` (lên đầu nếu là cột đầu tiên), rồi xếp theo nhóm cố định trái → thường → phải.
 */
export function mergeColumnOrder(columns: readonly SettingColumn[], order: readonly string[]): string[] {
  const known = new Set(columns.map((column) => column.key))
  const merged = [...new Set(order)].filter((key) => known.has(key))
  let previous: string | undefined
  for (const { key } of columns) {
    if (!merged.includes(key)) {
      merged.splice(previous === undefined ? 0 : merged.indexOf(previous) + 1, 0, key)
    }
    previous = key
  }
  const pins = new Map(columns.map((column) => [column.key, column.pin]))
  return PIN_ORDER.flatMap((pin) => merged.filter((key) => pins.get(key) === pin))
}

/**
 * Chuẩn hoá thiết lập theo `columns` hiện tại (thiết lập lưu từ bộ cột cũ, hoặc chưa có): bỏ key không còn, thứ tự
 * trùng thứ tự gốc → `[]`, luôn còn ít nhất một cột hiện, `defaultSort` trỏ cột không còn sắp xếp được → tắt.
 */
export function mergeTableSettings(
  columns: readonly SettingColumn[],
  settings: TableSettings | null,
): TableSettings {
  const order = mergeColumnOrder(columns, settings?.columnOrder ?? [])
  const hidden = new Set(settings?.hiddenColumns)
  const hiddenColumns = order.filter((key) => hidden.has(key))
  // Mọi cột đều ẩn (vd cột duy nhất còn hiện đã bị bỏ khỏi columns) → hiện lại cột đầu tiên.
  if (hiddenColumns.length && hiddenColumns.length === order.length) hiddenColumns.shift()
  const sort = settings?.defaultSort ?? null
  const sortable = sort !== null && columns.some((column) => column.sortField === sort.field)
  return {
    columnOrder: isSameList(order, mergeColumnOrder(columns, [])) ? [] : order,
    hiddenColumns,
    defaultSort: sortable ? { field: sort.field, order: sort.order } : null,
  }
}

export function isSameTableSort(a: TableSort | null, b: TableSort | null): boolean {
  if (a === null || b === null) return a === b
  return a.field === b.field && a.order === b.order
}

/** Thiết lập (đã chuẩn hoá) trùng cấu hình gốc của trang — không cần lưu. */
export function isDefaultTableSettings(settings: TableSettings): boolean {
  return !settings.columnOrder.length && !settings.hiddenColumns.length && settings.defaultSort === null
}

/**
 * Cột đưa cho a-table theo thiết lập: cột cấu hình được xếp theo `columnOrder`, lấp đúng các vị trí của cột cấu hình
 * được (cột tiện ích `title: ''` giữ nguyên chỗ), rồi bỏ cột ẩn. Trả mảng mới, không sửa cột gốc.
 */
export function displayColumnsOf<C extends TableColumnLike>(columns: readonly C[], settings: TableSettings): C[] {
  const entries = columns.flatMap((column, i) =>
    columnLabelOf(column, i) === undefined ? [] : [{ column, key: columnKeyOf(column, i) }],
  )
  const order = mergeColumnOrder(settingColumnsOf(columns), settings.columnOrder)
  // Trang khai báo trùng key → các cột trùng đi liền nhau, không cột nào bị mất.
  const arranged = order.flatMap((key) => entries.filter((entry) => entry.key === key))
  const hidden = new Set(settings.hiddenColumns)
  let slot = 0
  return columns.flatMap((column, i) => {
    if (columnLabelOf(column, i) === undefined) return [column]
    const entry = arranged[slot++]
    return entry && !hidden.has(entry.key) ? [entry.column] : []
  })
}

/**
 * Chuyển cột `key` tới vị trí `to` trong `order` (thứ tự đầy đủ từ mergeColumnOrder), giới hạn trong nhóm cố định
 * của cột. Trả mảng mới; key không có trong `order` → giữ nguyên thứ tự.
 */
export function moveColumn(
  order: readonly string[],
  key: string,
  to: number,
  columns: readonly SettingColumn[],
): string[] {
  if (!order.includes(key)) return [...order]
  const pins = new Map(columns.map((column) => [column.key, column.pin]))
  const pin = pins.get(key)
  const first = order.findIndex((item) => pins.get(item) === pin)
  const last = order.findLastIndex((item) => pins.get(item) === pin)
  const next = order.filter((item) => item !== key)
  next.splice(Math.min(Math.max(to, first), last), 0, key)
  return next
}

function isMultipleSorter(sorter: unknown): boolean {
  return isPlainObject(sorter) && typeof sorter.multiple === 'number'
}

/**
 * CTable tự điều khiển `sortOrder` được không: có cột `sorter`, mọi cột `sorter` có field, trang chưa tự điều khiển
 * (không cột nào khai báo `sortOrder`), không sắp xếp nhiều cột và không có cột nhóm (`children`) — các trường hợp
 * còn lại để a-table tự giữ trạng thái như cũ.
 */
export function canControlSort(columns: readonly TableColumnLike[]): boolean {
  const sortable = columns.filter((column) => column.sorter)
  return (
    sortable.length > 0 &&
    columns.every((column) => column.children === undefined && !('sortOrder' in column)) &&
    sortable.every((column) => sortFieldOf(column) !== null && !isMultipleSorter(column.sorter))
  )
}

/** Gộp `sortOrder` vào các cột `sorter` theo sắp xếp đang áp dụng (chế độ controlled của a-table). */
export function mergeSortOrder<C extends TableColumnLike>(columns: readonly C[], sort: TableSort | null): C[] {
  return columns.map((column) => {
    const field = sortFieldOf(column)
    if (field === null) return column
    return { ...column, sortOrder: sort?.field === field ? sort.order : null }
  })
}

/** Sắp xếp khai báo trong code (`defaultSortOrder` của cột) — dùng khi chưa có sắp xếp mặc định của người dùng. */
export function defaultSortOf(columns: readonly TableColumnLike[]): TableSort | null {
  for (const column of columns) {
    const field = sortFieldOf(column)
    const order = column.defaultSortOrder
    if (field !== null && isTableSortOrder(order)) return { field, order }
  }
  return null
}

/** Cột ứng với sắp xếp (so theo field) — để dựng sorter của sự kiện change. */
export function sortColumnOf<C extends TableColumnLike>(columns: readonly C[], sort: TableSort): C | undefined {
  return columns.find((column) => sortFieldOf(column) === sort.field)
}

/** Sorter a-table phát ở `@change` → TableSort; bỏ sắp xếp, sắp xếp nhiều cột hoặc field dạng mảng → null. */
export function toTableSort(sorter: unknown): TableSort | null {
  if (!isPlainObject(sorter)) return null
  const { field, order } = sorter
  const sortField = toSortField(field)
  return sortField !== null && isTableSortOrder(order) ? { field: sortField, order } : null
}
