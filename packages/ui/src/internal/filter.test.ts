import { describe, expect, it } from 'vitest'
import {
  activeFiltersOf,
  formatFilterValue,
  isEmptyFilterValue,
  sanitizeFilterValues,
} from './filter'
import type { TableFilterField } from './filter'

const STATUS_OPTIONS = [
  { label: 'Hoạt động', value: 1 },
  { label: 'Ngừng', value: 0 },
]

const fields: TableFilterField[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: STATUS_OPTIONS },
  { key: 'updatedAt', label: 'Ngày cập nhật', type: 'dateRange' },
  { key: 'code', label: 'Mã xe', type: 'input' },
]

describe('isEmptyFilterValue / sanitizeFilterValues', () => {
  it('null, undefined, chuỗi trắng, mảng rỗng hoặc toàn phần tử rỗng → rỗng', () => {
    for (const value of [undefined, null, '', '   ', [], [null, null], ['', undefined]]) {
      expect(isEmptyFilterValue(value)).toBe(true)
    }
  })

  it('0, false, object, mảng còn 1 phần tử có giá trị → vẫn là điều kiện lọc', () => {
    for (const value of [0, false, 'a', {}, ['2026-09-01', null], [0]]) {
      expect(isEmptyFilterValue(value)).toBe(false)
    }
  })

  it('bỏ trường rỗng, trim chuỗi, sao chép mảng, không sửa object đầu vào', () => {
    const brand = ['GEELY']
    const extra = { min: 1 }
    const input = { code: '  E22H ', brand, status: 0, empty: '', range: [null, null], extra }
    const out = sanitizeFilterValues(input)
    expect(out).toEqual({ code: 'E22H', brand: ['GEELY'], status: 0, extra })
    expect(out.brand).not.toBe(brand)
    expect(input.code).toBe('  E22H ')
  })
})

describe('formatFilterValue', () => {
  it('select → nhãn option (nhiều giá trị nối dấu phẩy); không có option thì hiện giá trị', () => {
    const field: TableFilterField = { key: 's', label: 'S', type: 'select', options: STATUS_OPTIONS }
    expect(formatFilterValue(field, 1)).toBe('Hoạt động')
    expect(formatFilterValue(field, [1, 0, 9])).toBe('Hoạt động, Ngừng, 9')
  })

  it('date → DD/MM/YYYY; chuỗi sai định dạng giữ nguyên', () => {
    const field: TableFilterField = { key: 'd', label: 'D', type: 'date' }
    expect(formatFilterValue(field, '2026-09-13')).toBe('13/09/2026')
    expect(formatFilterValue(field, '2026-09-13T08:00:00')).toBe('13/09/2026')
    expect(formatFilterValue(field, 'hôm nay')).toBe('hôm nay')
  })

  it('dateRange → "từ – đến"; thiếu một đầu thì ghi Từ/Đến', () => {
    const field: TableFilterField = { key: 'r', label: 'R', type: 'dateRange' }
    expect(formatFilterValue(field, ['2026-09-01', '2026-09-13'])).toBe('01/09/2026 – 13/09/2026')
    expect(formatFilterValue(field, ['2026-09-01', null])).toBe('Từ 01/09/2026')
    expect(formatFilterValue(field, [null, '2026-09-13'])).toBe('Đến 13/09/2026')
    expect(formatFilterValue(field, '2026-09-13')).toBe('13/09/2026')
  })

  it('input/custom/không khai báo → chuỗi, mảng nối dấu phẩy, boolean thành Có/Không', () => {
    const custom: TableFilterField = { key: 'c', label: 'C', type: 'custom' }
    expect(formatFilterValue({ key: 'i', label: 'I', type: 'input' }, 'E22H')).toBe('E22H')
    expect(formatFilterValue(custom, ['a', '', 'b'])).toBe('a, b')
    expect(formatFilterValue(undefined, true)).toBe('Có')
    expect(formatFilterValue(undefined, false)).toBe('Không')
  })

  it('field.format được ưu tiên hơn cách hiển thị mặc định', () => {
    const field: TableFilterField = {
      key: 'price',
      label: 'Giá',
      type: 'custom',
      format: (value) => `≥ ${String(value)} ₫`,
    }
    expect(formatFilterValue(field, 500)).toBe('≥ 500 ₫')
  })
})

describe('activeFiltersOf', () => {
  it('liệt kê điều kiện có giá trị theo thứ tự fields, bỏ trường rỗng', () => {
    const values = { code: 'E22H', status: 0, updatedAt: [null, null] }
    expect(activeFiltersOf(fields, values)).toEqual([
      { key: 'status', label: 'Trạng thái', text: 'Ngừng' },
      { key: 'code', label: 'Mã xe', text: 'E22H' },
    ])
  })

  it('key không khai báo trong fields vẫn hiện (nhãn = key) để không lọc ngầm', () => {
    expect(activeFiltersOf(fields, { dealerId: 'D01', blank: '' })).toEqual([
      { key: 'dealerId', label: 'dealerId', text: 'D01' },
    ])
  })
})
