// Tiện ích thuần cho bộ lọc dựng sẵn của CTable: kiểu trường lọc, nhận biết giá trị rỗng, làm sạch giá
// trị trước khi phát ra ngoài, định dạng điều kiện trên thanh lọc. Tách khỏi SFC để test trực tiếp;
// không phụ thuộc ant-design-vue.

/** Bộ lọc: key trường → giá trị. CTable phát nguyên object; useTable gửi qua `TableQuery.filters`. */
export type TableFilterValues = Record<string, unknown>

export interface TableFilterOption {
  label: string
  value: string | number
}

interface TableFilterFieldBase {
  /** Key trong filterValues — cũng là key gửi lên backend. */
  key: string
  /** Nhãn ở form lọc và trên thẻ điều kiện. */
  label: string
  /** Placeholder của control (input/select/date); bỏ trống thì dùng mặc định của antdv. */
  placeholder?: string
  /** Chuỗi hiển thị giá trị trên thẻ điều kiện; mặc định suy theo `type`/`options`. */
  format?: (value: unknown) => string
}

export interface TableFilterInputField extends TableFilterFieldBase {
  type: 'input'
}

export interface TableFilterSelectField extends TableFilterFieldBase {
  type: 'select'
  options: TableFilterOption[]
  /** Chọn nhiều — giá trị là mảng. */
  multiple?: boolean
}

export interface TableFilterDateField extends TableFilterFieldBase {
  /** `date`: chuỗi `YYYY-MM-DD`; `dateRange`: `[từ, đến]` cùng định dạng. */
  type: 'date' | 'dateRange'
}

export interface TableFilterCustomField extends TableFilterFieldBase {
  /** Control do trang tự render qua slot `#filterField`; giá trị dạng object nên kèm `format`. */
  type: 'custom'
}

/** Trường của drawer lọc dựng sẵn — trang tự khai báo, giống `columns`. */
export type TableFilterField =
  | TableFilterInputField
  | TableFilterSelectField
  | TableFilterDateField
  | TableFilterCustomField

/** Một điều kiện đang áp dụng — hiển thị thành thẻ trên thanh lọc. */
export interface TableFilterCondition {
  key: string
  label: string
  /** Giá trị đã định dạng để hiển thị. */
  text: string
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/

/**
 * Giá trị coi là "không lọc": null/undefined, chuỗi chỉ có khoảng trắng, mảng rỗng hoặc toàn phần tử
 * rỗng (vd khoảng ngày đã xoá `[null, null]`). `0` và `false` vẫn là điều kiện lọc hợp lệ.
 */
export function isEmptyFilterValue(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.every((item) => isEmptyFilterValue(item))
  return false
}

/**
 * Bỏ trường rỗng, trim chuỗi, sao chép mảng. Kết quả là object mới, tách khỏi bản nháp của form (form
 * sửa tiếp không làm đổi bộ lọc đã phát ra).
 */
export function sanitizeFilterValues(values: TableFilterValues): TableFilterValues {
  const out: TableFilterValues = {}
  for (const [key, value] of Object.entries(values)) {
    if (isEmptyFilterValue(value)) continue
    if (typeof value === 'string') out[key] = value.trim()
    else if (Array.isArray(value)) out[key] = [...value]
    else out[key] = value
  }
  return out
}

function toText(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  return String(value)
}

/** Nối các phần tử khác rỗng bằng ", " (giá trị đơn coi như mảng 1 phần tử). */
function formatList(value: unknown, formatItem: (item: unknown) => string = toText): string {
  const items: unknown[] = Array.isArray(value) ? value : [value]
  return items
    .filter((item) => !isEmptyFilterValue(item))
    .map((item) => formatItem(item))
    .join(', ')
}

/** `YYYY-MM-DD…` → `DD/MM/YYYY`; chuỗi không đúng định dạng giữ nguyên. */
function formatDate(value: unknown): string {
  return typeof value === 'string' && ISO_DATE_RE.test(value)
    ? value.slice(0, 10).split('-').reverse().join('/')
    : toText(value)
}

function formatDateRange(value: unknown): string {
  if (!Array.isArray(value)) return formatDate(value)
  const items: unknown[] = value
  const [from = '', to = ''] = items.map((item) => (isEmptyFilterValue(item) ? '' : formatDate(item)))
  if (from && to) return `${from} – ${to}`
  return from ? `Từ ${from}` : `Đến ${to}`
}

function optionLabelOf(options: readonly TableFilterOption[], value: unknown): string {
  return options.find((option) => option.value === value)?.label ?? toText(value)
}

/** Chuỗi hiển thị giá trị lọc trên thẻ điều kiện; `field.format` được ưu tiên. */
export function formatFilterValue(field: TableFilterField | undefined, value: unknown): string {
  if (!field) return formatList(value)
  if (field.format) return field.format(value)
  switch (field.type) {
    case 'select': {
      const { options } = field
      return formatList(value, (item) => optionLabelOf(options, item))
    }
    case 'date':
      return formatDate(value)
    case 'dateRange':
      return formatDateRange(value)
    default:
      return formatList(value)
  }
}

/**
 * Các điều kiện đang áp dụng, theo thứ tự `fields`. Key có giá trị nhưng không khai báo trong `fields`
 * vẫn được liệt kê (nhãn = key) để người dùng thấy và bỏ được — tránh lọc ngầm.
 */
export function activeFiltersOf(
  fields: readonly TableFilterField[],
  values: TableFilterValues,
): TableFilterCondition[] {
  const declared = new Set(fields.map((field) => field.key))
  const conditions: TableFilterCondition[] = []
  for (const field of fields) {
    const value = values[field.key]
    if (isEmptyFilterValue(value)) continue
    conditions.push({ key: field.key, label: field.label, text: formatFilterValue(field, value) })
  }
  for (const [key, value] of Object.entries(values)) {
    if (declared.has(key) || isEmptyFilterValue(value)) continue
    conditions.push({ key, label: key, text: formatFilterValue(undefined, value) })
  }
  return conditions
}
