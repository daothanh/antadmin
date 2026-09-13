import { computed, reactive, ref, shallowRef } from 'vue'
import type { Ref } from 'vue'
import { toAppError } from '@antadmin/utils'
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
}

// Cấu trúc tham số của sự kiện @change từ a-table/CTable.
interface AntdPagination {
  current?: number
  pageSize?: number
}
interface AntdSorter {
  field?: string
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
 * Quản lý state phân trang/sắp xếp/lọc cho CTable, gọi dữ liệu qua fetcher
 * (thường tạo từ useApi). Trả về props sẵn sàng bind vào CTable: `pagination` + `onChange`,
 * bộ lọc dựng sẵn `filterValues` + `onFilter` (gộp với filter cột vào `query.filters`).
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

  const query = reactive<TableQuery>({
    page: 1,
    pageSize: options.pageSize ?? 20,
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

  /** Bind trực tiếp vào `@change` của CTable. */
  function onChange(
    pag: AntdPagination,
    filters?: Record<string, unknown>,
    sorter?: AntdSorter,
  ): Promise<void> {
    query.page = pag.current ?? query.page
    query.pageSize = pag.pageSize ?? query.pageSize
    columnFilters = filters
    query.filters = mergeFilters(formFilters.value, columnFilters)
    query.sortField = sorter?.field
    query.sortOrder = sorter?.order ?? undefined
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
