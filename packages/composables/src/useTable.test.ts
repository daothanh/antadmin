import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import type { Paginated } from '@antadmin/utils'
import { useTable } from './useTable'

interface Row {
  id: number
}

function makeFetcher(total = 42) {
  return vi.fn(
    async (): Promise<Paginated<Row>> => ({
      items: [{ id: 1 }, { id: 2 }],
      total,
    }),
  )
}

describe('useTable', () => {
  it('tự load lần đầu (immediate mặc định) và set dataSource/total', async () => {
    const fetcher = makeFetcher()
    const t = useTable(fetcher, { pageSize: 20 })
    await nextTick()
    await Promise.resolve()
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(t.dataSource.value).toHaveLength(2)
    expect(t.total.value).toBe(42)
    expect(t.pagination.value).toMatchObject({ current: 1, pageSize: 20, total: 42 })
  })

  it('immediate:false thì không tự gọi', () => {
    const fetcher = makeFetcher()
    useTable(fetcher, { immediate: false })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('onChange cập nhật page/pageSize/sort/filter rồi load lại', async () => {
    const fetcher = makeFetcher()
    const t = useTable(fetcher, { immediate: false })
    await t.onChange({ current: 3, pageSize: 50 }, { status: ['active'] }, {
      field: 'name',
      order: 'descend',
    })
    expect(t.query.page).toBe(3)
    expect(t.query.pageSize).toBe(50)
    expect(t.query.sortField).toBe('name')
    expect(t.query.sortOrder).toBe('descend')
    expect(t.query.filters).toEqual({ status: ['active'] })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('onFilter thay bộ lọc form, về trang 1, load với filters; filterValues phản ánh bộ lọc form', async () => {
    const fetcher = makeFetcher()
    const t = useTable(fetcher, { immediate: false })
    t.query.page = 4
    await t.onFilter({ status: 1, brand: ['GEELY'] })
    expect(t.query.page).toBe(1)
    expect(t.filterValues.value).toEqual({ status: 1, brand: ['GEELY'] })
    expect(fetcher).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, filters: { status: 1, brand: ['GEELY'] } }),
    )
  })

  it('đổi trang sau khi lọc → giữ bộ lọc form, gộp filter cột (trùng key thì form thắng)', async () => {
    const fetcher = makeFetcher()
    const t = useTable(fetcher, { immediate: false })
    await t.onFilter({ status: 1 })
    await t.onChange({ current: 2 }, { status: null, dept: ['kt'] })
    expect(t.query.page).toBe(2)
    expect(t.query.filters).toEqual({ status: 1, dept: ['kt'] })

    // Bỏ hết bộ lọc form → chỉ còn filter cột; bỏ cả filter cột → undefined như trước.
    await t.onFilter({})
    expect(t.query.filters).toEqual({ status: null, dept: ['kt'] })
    await t.onChange({ current: 1 })
    expect(t.query.filters).toBeUndefined()
  })

  it('options.filters → bộ lọc mặc định có ngay ở lần load đầu', async () => {
    const fetcher = makeFetcher()
    const t = useTable(fetcher, { filters: { status: 1 } })
    await nextTick()
    expect(t.filterValues.value).toEqual({ status: 1 })
    expect(fetcher).toHaveBeenCalledWith(expect.objectContaining({ filters: { status: 1 } }))
  })

  it('reload đưa page về 1', async () => {
    const fetcher = makeFetcher()
    const t = useTable(fetcher, { immediate: false })
    t.query.page = 5
    await t.reload()
    expect(t.query.page).toBe(1)
  })

  it('lỗi fetcher → set error (AppError) và ném ra', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('mạng lỗi')
    })
    const t = useTable(fetcher, { immediate: false })
    await expect(t.load()).rejects.toMatchObject({ name: 'AppError', message: 'mạng lỗi' })
    expect(t.error.value).toMatchObject({ message: 'mạng lỗi' })
    expect(t.loading.value).toBe(false)
  })
})
