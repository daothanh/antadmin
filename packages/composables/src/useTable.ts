import { computed, reactive, ref } from 'vue'
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

/**
 * Quản lý state phân trang/sắp xếp/lọc cho CTable, gọi dữ liệu qua fetcher
 * (thường tạo từ useApi). Trả về props sẵn sàng bind vào CTable.
 */
export function useTable<T>(fetcher: TableFetcher<T>, options: UseTableOptions = {}) {
  const dataSource = ref([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<unknown>(null)
  const total = ref(0)

  const query = reactive<TableQuery>({
    page: 1,
    pageSize: options.pageSize ?? 20,
  })

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
    query.filters = filters
    query.sortField = sorter?.field
    query.sortOrder = sorter?.order ?? undefined
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

  return { dataSource, loading, error, total, query, pagination, load, reload, onChange }
}
