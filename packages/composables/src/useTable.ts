import { computed, reactive, ref, shallowRef } from 'vue'
import type { Ref } from 'vue'
import { getTableSettings, toAppError } from '@antadmin/utils'
import type { Paginated } from '@antadmin/utils'

export interface TableQuery {
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: 'ascend' | 'descend'
  filters?: Record<string, unknown>
}

export type TableFetcher<T> = (query: TableQuery) => Promise<Paginated<T>>

export interface UseTableOptions {
  pageSize?: number
  /** Tự load lần đầu (mặc định true). Đặt false nếu muốn tự gọi trong onMounted. */
  immediate?: boolean
  /** Bộ lọc form ban đầu (vd mặc định lọc theo trạng thái) — có hiệu lực ngay từ lần load đầu. */
  filters?: Record<string, unknown>
  /**
   * Khoá thiết lập của CTable (`settings-key`, cùng giá trị) — đọc sắp xếp mặc định người dùng đã lưu để lần load
   * đầu đúng thứ tự, không phải tải lại khi bảng dựng xong.
   */
  settingsKey?: string
}

// Cấu trúc tham số của sự kiện @change từ a-table/CTable.
interface AntdPagination {
  current?: number
  pageSize?: number
}
interface AntdSorter {
  /** dataIndex của cột — mảng khi dataIndex lồng (`['owner', 'name']`). */
  field?: string | number | readonly (string | number)[]
  order?: 'ascend' | 'descend' | null
}

/** Gộp filter cột của a-table với bộ lọc form (trùng key thì form thắng); cả hai rỗng → undefined. */
function mergeFilters(
  formFilters: Record<string, unknown>,
  columnFilters: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!columnFilters && !Object.keys(formFilters).length) return undefined
  return { ...columnFilters, ...formFilters }
}

/**
 * Sắp xếp gửi fetcher từ sorter của a-table: bỏ sắp xếp (không có order) → không gửi field; sắp xếp nhiều cột
 * (mảng) → lấy cột đầu vì TableQuery chỉ giữ một cột; dataIndex lồng nối bằng '.'.
 */
function toQuerySort(sorter: AntdSorter | AntdSorter[] | undefined): Pick<TableQuery, 'sortField' | 'sortOrder'> {
  const { field, order } = (Array.isArray(sorter) ? sorter[0] : sorter) ?? {}
  if (!order || field === undefined) return { sortField: undefined, sortOrder: undefined }
  return { sortField: Array.isArray(field) ? field.join('.') : String(field), sortOrder: order }
}

/**
 * Quản lý state phân trang/sắp xếp/lọc cho CTable, gọi dữ liệu qua fetcher
 * (thường tạo từ useApi). Trả về props sẵn sàng bind vào CTable: `pagination` + `onChange`,
 * bộ lọc dựng sẵn `filterValues` + `onFilter` (gộp với filter cột vào `query.filters`);
 * `options.settingsKey` để lần load đầu theo sắp xếp mặc định đã lưu trong thiết lập của CTable.
 */
export function useTable<T>(fetcher: TableFetcher<T>, options: UseTableOptions = {}) {
  const dataSource = ref([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<unknown>(null)
  const total = ref(0)

  // Bộ lọc form (drawer lọc của CTable) giữ tách khỏi filter cột: @change của a-table phát lại filter cột
  // mỗi lần đổi trang/sort — gán thẳng vào query.filters sẽ xoá mất bộ lọc form.
  const formFilters = shallowRef<Record<string, unknown>>({ ...options.filters })
  let columnFilters: Record<string, unknown> | undefined

  // Sắp xếp mặc định người dùng lưu ở CTable (cùng settingsKey) có hiệu lực ngay từ lần load đầu.
  const savedSort = options.settingsKey ? getTableSettings(options.settingsKey)?.defaultSort : undefined
  const query = reactive<TableQuery>({
    page: 1,
    pageSize: options.pageSize ?? 20,
    ...(savedSort ? { sortField: savedSort.field, sortOrder: savedSort.order } : {}),
    filters: mergeFilters(formFilters.value, columnFilters),
  })
  const filterValues = computed(() => formFilters.value)

  const pagination = computed(() => ({
    current: query.page,
    pageSize: query.pageSize,
    total: total.value,
    showSizeChanger: true,
  }))

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const result = await fetcher({ ...query })
      dataSource.value = result.items
      total.value = result.total
    } catch (caught) {
      const appError = toAppError(caught)
      error.value = appError
      throw appError
    } finally {
      loading.value = false
    }
  }

  /** Bind trực tiếp vào `@change` của CTable (kể cả change CTable phát khi lưu sắp xếp mặc định mới). */
  function onChange(
    pag: AntdPagination,
    filters?: Record<string, unknown>,
    sorter?: AntdSorter | AntdSorter[],
  ): Promise<void> {
    query.page = pag.current ?? query.page
    query.pageSize = pag.pageSize ?? query.pageSize
    columnFilters = filters
    query.filters = mergeFilters(formFilters.value, columnFilters)
    const sort = toQuerySort(sorter)
    query.sortField = sort.sortField
    query.sortOrder = sort.sortOrder
    return load()
  }

  /** Bind vào `@update:filter-values` của CTable: thay bộ lọc form, về trang 1 rồi tải lại. */
  function onFilter(values: Record<string, unknown>): Promise<void> {
    formFilters.value = { ...values }
    query.filters = mergeFilters(formFilters.value, columnFilters)
    query.page = 1
    return load()
  }

  /** Quay về trang 1 và tải lại. */
  function reload(): Promise<void> {
    query.page = 1
    return load()
  }

  if (options.immediate ?? true) {
    void load()
  }

  return {
    dataSource,
    loading,
    error,
    total,
    query,
    pagination,
    filterValues,
    load,
    reload,
    onChange,
    onFilter,
  }
}
