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
