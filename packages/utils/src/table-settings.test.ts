import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearTableSettings,
  getTableSettings,
  isTableSortOrder,
  parseTableSettings,
  setTableSettings,
  tableSettingsKeyOf,
} from './table-settings'
import type { TableSettings } from './table-settings'

function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key)
    }),
  }
}

function createBrokenStorage() {
  const fail = () => {
    throw new DOMException('Không truy cập được storage', 'SecurityError')
  }
  return { getItem: vi.fn(fail), setItem: vi.fn(fail), removeItem: vi.fn(fail) }
}

const SETTINGS: TableSettings = {
  columnOrder: ['name', 'code'],
  hiddenColumns: ['status'],
  defaultSort: { field: 'updatedAt', order: 'descend' },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('tableSettingsKeyOf / isTableSortOrder', () => {
  it('key storage có namespace antadmin:table: + settingsKey của bảng', () => {
    expect(tableSettingsKeyOf('orders')).toBe('antadmin:table:orders')
    expect(tableSettingsKeyOf('orders:items')).toBe('antadmin:table:orders:items')
  })

  it('chỉ nhận ascend/descend', () => {
    expect(isTableSortOrder('ascend')).toBe(true)
    expect(isTableSortOrder('descend')).toBe(true)
    expect(isTableSortOrder(null)).toBe(false)
    expect(isTableSortOrder('asc')).toBe(false)
  })
})

describe('parseTableSettings', () => {
  it('dữ liệu hợp lệ → object mới chỉ gồm field đã biết', () => {
    const columnOrder = ['name', 'code']
    const raw = {
      version: 1,
      columnOrder,
      hiddenColumns: ['status'],
      defaultSort: { field: 'updatedAt', order: 'descend', extra: true },
      extra: 'bỏ qua',
    }
    const parsed = parseTableSettings(raw)
    expect(parsed).toEqual(SETTINGS)
    expect(parsed?.columnOrder).not.toBe(columnOrder)
  })

  it('defaultSort null → tắt sắp xếp mặc định', () => {
    expect(parseTableSettings({ version: 1, columnOrder: [], hiddenColumns: [], defaultSort: null })).toEqual({
      columnOrder: [],
      hiddenColumns: [],
      defaultSort: null,
    })
  })

  it('sai version hoặc sai cấu trúc → null', () => {
    const valid = { version: 1, columnOrder: [], hiddenColumns: [], defaultSort: null }
    const invalid: unknown[] = [
      null,
      'chuỗi',
      [valid],
      { ...valid, version: 2 },
      { ...valid, version: '1' },
      { ...valid, columnOrder: 'name' },
      { ...valid, hiddenColumns: ['status', 1] },
      { ...valid, defaultSort: undefined },
      { ...valid, defaultSort: ['updatedAt', 'ascend'] },
      { ...valid, defaultSort: { field: '', order: 'ascend' } },
      { ...valid, defaultSort: { field: 1, order: 'ascend' } },
      { ...valid, defaultSort: { field: 'updatedAt', order: 'asc' } },
    ]
    for (const raw of invalid) {
      expect(parseTableSettings(raw)).toBeNull()
    }
  })
})

describe('getTableSettings / setTableSettings / clearTableSettings', () => {
  it('ghi kèm version theo key của bảng rồi đọc lại đúng thiết lập', () => {
    const storage = createMemoryStorage()
    setTableSettings('orders', SETTINGS, { storage })
    expect(JSON.parse(storage.data.get('antadmin:table:orders') ?? '')).toEqual({ version: 1, ...SETTINGS })
    expect(getTableSettings('orders', { storage })).toEqual(SETTINGS)
  })

  it('chỉ ghi field đã biết của thiết lập; defaultSort null giữ nguyên', () => {
    const storage = createMemoryStorage()
    const withExtra = {
      ...SETTINGS,
      defaultSort: { field: 'code', order: 'ascend' as const, label: 'Mã' },
      userId: 'u1',
    }
    setTableSettings('orders', withExtra, { storage })
    expect(JSON.parse(storage.data.get('antadmin:table:orders') ?? '')).toEqual({
      version: 1,
      columnOrder: ['name', 'code'],
      hiddenColumns: ['status'],
      defaultSort: { field: 'code', order: 'ascend' },
    })
    setTableSettings('orders', { ...SETTINGS, defaultSort: null }, { storage })
    expect(getTableSettings('orders', { storage })?.defaultSort).toBeNull()
  })

  it('chưa lưu, JSON hỏng hoặc dữ liệu sai cấu trúc → null', () => {
    const storage = createMemoryStorage({
      'antadmin:table:broken': '{không phải json',
      'antadmin:table:old': JSON.stringify({ version: 0, columns: ['name'] }),
    })
    expect(getTableSettings('orders', { storage })).toBeNull()
    expect(getTableSettings('broken', { storage })).toBeNull()
    expect(getTableSettings('old', { storage })).toBeNull()
  })

  it('xoá đúng thiết lập của bảng, bảng khác trên cùng trang giữ nguyên', () => {
    const storage = createMemoryStorage()
    setTableSettings('orders', SETTINGS, { storage })
    setTableSettings('orders:items', { ...SETTINGS, hiddenColumns: [] }, { storage })
    clearTableSettings('orders', { storage })
    expect(getTableSettings('orders', { storage })).toBeNull()
    expect(getTableSettings('orders:items', { storage })).toEqual({ ...SETTINGS, hiddenColumns: [] })
  })

  it('storage ném lỗi (bị chặn, quota đầy) → đọc ra null, ghi/xoá bỏ qua không ném', () => {
    const storage = createBrokenStorage()
    expect(getTableSettings('orders', { storage })).toBeNull()
    expect(() => setTableSettings('orders', SETTINGS, { storage })).not.toThrow()
    expect(() => clearTableSettings('orders', { storage })).not.toThrow()
    expect(storage.setItem).toHaveBeenCalledTimes(1)
    expect(storage.removeItem).toHaveBeenCalledTimes(1)
  })

  it('không truyền storage → dùng localStorage của trình duyệt', () => {
    const storage = createMemoryStorage()
    vi.stubGlobal('localStorage', storage)
    setTableSettings('orders', SETTINGS)
    expect(getTableSettings('orders')).toEqual(SETTINGS)
    clearTableSettings('orders')
    expect(storage.data.size).toBe(0)
  })

  it('môi trường không có localStorage (SSR/Node) → null, ghi/xoá không làm gì', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(getTableSettings('orders')).toBeNull()
    expect(() => setTableSettings('orders', SETTINGS)).not.toThrow()
    expect(() => clearTableSettings('orders')).not.toThrow()
  })

  it('trình duyệt chặn truy cập localStorage (SecurityError) → coi như không có storage', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Truy cập bị chặn', 'SecurityError')
      },
    })
    try {
      expect(getTableSettings('orders')).toBeNull()
      expect(() => setTableSettings('orders', SETTINGS)).not.toThrow()
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original)
      else Reflect.deleteProperty(globalThis, 'localStorage')
    }
  })
})
