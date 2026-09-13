// Tiện ích thuần cho CTable: chuẩn hoá attrs, định danh cột, gộp phân trang chuẩn, lớp dòng xen kẽ.
// Tách khỏi SFC để test trực tiếp; không phụ thuộc ant-design-vue.

/** Phần cấu hình cột mà CTable cần đọc (tương thích ColumnType của antdv). */
export interface TableColumnLike {
  key?: string | number
  dataIndex?: string | number | readonly (string | number)[]
  title?: unknown
  /** `'left'` / `true` / `'right'` — cột cố định. */
  fixed?: unknown
  sorter?: unknown
  sortOrder?: unknown
  defaultSortOrder?: unknown
  /** Cột nhóm (header nhiều tầng). */
  children?: unknown
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Chuẩn hoá key attrs về camelCase (template giữ nguyên `data-source`, `row-class-name`…). */
export function camelizeKeys(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(record)) {
    out[key.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())] = value
  }
  return out
}

/** Key do trang khai báo: `key` → `dataIndex` (mảng nối bằng '.'); không có → undefined. */
function declaredKeyOf(column: TableColumnLike): string | undefined {
  if (column.key !== undefined && column.key !== '') return String(column.key)
  const { dataIndex } = column
  if (Array.isArray(dataIndex)) return dataIndex.length ? dataIndex.join('.') : undefined
  return dataIndex !== undefined && dataIndex !== '' ? String(dataIndex) : undefined
}

/** Key định danh cột: `key` → `dataIndex` (mảng nối bằng '.') → vị trí trong mảng columns. */
export function columnKeyOf(column: TableColumnLike, position: number): string {
  return declaredKeyOf(column) ?? `__col_${position}`
}

/** Cột có `key`/`dataIndex` — key không phụ thuộc vị trí nên lưu thiết lập theo key được. */
export function hasColumnKey(column: TableColumnLike): boolean {
  return declaredKeyOf(column) !== undefined
}

/**
 * Nhãn cột trong drawer thiết lập: title dạng chữ/số, title tuỳ biến (VNode/hàm) thì dùng key.
 * Title rỗng `''` là cột tiện ích (vd menu ⋮) → undefined: không cấu hình được, giữ nguyên vị trí.
 */
export function columnLabelOf(column: TableColumnLike, position: number): string | undefined {
  const { title } = column
  if (title === '') return undefined
  return typeof title === 'string' || typeof title === 'number'
    ? String(title)
    : columnKeyOf(column, position)
}

/** Nhãn tổng số dòng mặc định ở chân bảng. */
export function formatTotal(total: number): string {
  return `Tổng số dòng ${total}`
}

/**
 * Phân trang chuẩn AntAdmin: "Tổng số dòng N", chọn số dòng/trang, cỡ mặc định (antdv tự thu
 * nhỏ khi bảng size middle/small). Object của trang ghi đè từng key; `false` tắt phân trang.
 * Nhãn "/ trang"… lấy từ locale vi_VN của ConfigProvider (layer đã bật).
 */
export function mergePagination(pagination: unknown): false | Record<string, unknown> {
  if (pagination === false) return false
  return {
    size: 'default',
    showSizeChanger: true,
    showTotal: formatTotal,
    ...(isPlainObject(pagination) ? pagination : {}),
  }
}

/** Gộp `rowClassName` của trang (chuỗi hoặc hàm) với lớp dòng xen kẽ khi `striped`. */
export function mergeRowClassName(rowClassName: unknown, striped: boolean) {
  return (record: unknown, index: number, indent: number): string => {
    const base = typeof rowClassName === 'function' ? rowClassName(record, index, indent) : rowClassName
    const classes = typeof base === 'string' && base ? [base] : []
    if (striped && index % 2 === 1) classes.push('c-table__row--striped')
    return classes.join(' ')
  }
}
