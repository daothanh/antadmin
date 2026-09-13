// Thiết lập bảng do người dùng tự chỉnh (thứ tự/ẩn cột, sắp xếp mặc định) và lưu trong Web Storage.
// Dùng chung cho @antadmin/ui (CTable đọc + ghi) và @antadmin/composables (useTable đọc sắp xếp mặc định trước
// lần tải đầu) nên đặt ở đây. Storage truyền vào được để test; không có storage (SSR, bị trình duyệt chặn) thì
// coi như chưa lưu, không ném lỗi.

/** Chiều sắp xếp — cùng giá trị với `TableQuery.sortOrder` và sorter của a-table. */
export type TableSortOrder = 'ascend' | 'descend'

/** Sắp xếp theo một cột. */
export interface TableSort {
  /** `dataIndex` của cột — giá trị a-table phát ở `sorter.field`, useTable gửi lên qua `sortField`. */
  field: string
  order: TableSortOrder
}

/** Thiết lập bảng của người dùng. Key cột = `key` → `dataIndex` của cột. */
export interface TableSettings {
  /** Key các cột cấu hình được theo thứ tự hiển thị; rỗng = đúng thứ tự khai báo trong `columns`. */
  columnOrder: string[]
  /** Key các cột đang ẩn. */
  hiddenColumns: string[]
  /** Sắp xếp áp dụng khi mở bảng; `null` = tắt (dữ liệu theo thứ tự mặc định của backend). */
  defaultSort: TableSort | null
}

/** Phần Web Storage cần dùng — `localStorage`, `sessionStorage` hoặc bản giả khi test. */
export type TableSettingsStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface TableSettingsStorageOptions {
  /** Nơi đọc/ghi; mặc định `localStorage` của trình duyệt. */
  storage?: TableSettingsStorage
}

const STORAGE_PREFIX = 'antadmin:table:'
// Tăng khi đổi cấu trúc lưu: dữ liệu khác version bị bỏ qua (người dùng thiết lập lại) thay vì đọc sai.
const SETTINGS_VERSION = 1

/** Key trong storage của một bảng: `antadmin:table:<settingsKey>`. */
export function tableSettingsKeyOf(settingsKey: string): string {
  return `${STORAGE_PREFIX}${settingsKey}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function isTableSortOrder(value: unknown): value is TableSortOrder {
  return value === 'ascend' || value === 'descend'
}

/**
 * Đọc thiết lập từ dữ liệu không tin cậy (JSON trong storage, response server). Sai cấu trúc hoặc khác version
 * → `null` để bảng dùng cấu hình gốc. Kết quả là object mới, chỉ gồm các field đã biết.
 */
export function parseTableSettings(raw: unknown): TableSettings | null {
  if (!isRecord(raw) || raw.version !== SETTINGS_VERSION) return null
  const { columnOrder, hiddenColumns, defaultSort } = raw
  if (!isStringList(columnOrder) || !isStringList(hiddenColumns)) return null
  if (defaultSort === null) {
    return { columnOrder: [...columnOrder], hiddenColumns: [...hiddenColumns], defaultSort: null }
  }
  if (!isRecord(defaultSort)) return null
  const { field, order } = defaultSort
  if (typeof field !== 'string' || field === '' || !isTableSortOrder(order)) return null
  return { columnOrder: [...columnOrder], hiddenColumns: [...hiddenColumns], defaultSort: { field, order } }
}

// Trình duyệt chặn lưu trữ (vd tắt cookie) ném SecurityError ngay khi truy cập `localStorage`.
function browserStorage(): TableSettingsStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined
  } catch {
    return undefined
  }
}

/** Thiết lập đã lưu của một bảng; chưa lưu, dữ liệu hỏng hoặc không truy cập được storage → `null`. */
export function getTableSettings(
  settingsKey: string,
  options: TableSettingsStorageOptions = {},
): TableSettings | null {
  const storage = options.storage ?? browserStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(tableSettingsKeyOf(settingsKey))
    return raw === null ? null : parseTableSettings(JSON.parse(raw))
  } catch {
    return null
  }
}

/**
 * Lưu thiết lập của một bảng (kèm version). Storage đầy hoặc bị chặn (vd Safari private) → bỏ qua: thiết lập
 * vẫn áp dụng trong phiên, chỉ không nhớ được cho lần mở sau.
 */
export function setTableSettings(
  settingsKey: string,
  settings: TableSettings,
  options: TableSettingsStorageOptions = {},
): void {
  const storage = options.storage ?? browserStorage()
  if (!storage) return
  const { columnOrder, hiddenColumns, defaultSort } = settings
  // Chỉ ghi field đã biết — object truyền vào có thể mang thêm dữ liệu khác.
  const payload = {
    version: SETTINGS_VERSION,
    columnOrder,
    hiddenColumns,
    defaultSort: defaultSort && { field: defaultSort.field, order: defaultSort.order },
  }
  try {
    storage.setItem(tableSettingsKeyOf(settingsKey), JSON.stringify(payload))
  } catch {
    // Không lưu được không phải lỗi của người dùng — giữ thiết lập trong phiên.
  }
}

/** Xoá thiết lập đã lưu của một bảng (người dùng đặt lại về cấu hình gốc). */
export function clearTableSettings(settingsKey: string, options: TableSettingsStorageOptions = {}): void {
  const storage = options.storage ?? browserStorage()
  if (!storage) return
  try {
    storage.removeItem(tableSettingsKeyOf(settingsKey))
  } catch {
    // Như setTableSettings: storage bị chặn thì không có gì để xoá.
  }
}
