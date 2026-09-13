import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  camelizeKeys,
  columnKeyOf,
  columnLabelOf,
  formatTotal,
  hasColumnKey,
  isPlainObject,
  mergePagination,
  mergeRowClassName,
} from './table'

describe('isPlainObject / camelizeKeys', () => {
  it('chỉ nhận object thường', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
  })

  it('đổi key kebab-case sang camelCase, giữ nguyên giá trị', () => {
    const fn = () => 'x'
    expect(camelizeKeys({ 'data-source': [1], 'row-class-name': fn, size: 'small' })).toEqual({
      dataSource: [1],
      rowClassName: fn,
      size: 'small',
    })
  })
})

describe('columnKeyOf / hasColumnKey / columnLabelOf', () => {
  it('key ưu tiên key → dataIndex (mảng nối dấu chấm) → vị trí', () => {
    expect(columnKeyOf({ key: 'code', dataIndex: 'x' }, 0)).toBe('code')
    expect(columnKeyOf({ key: 7 }, 0)).toBe('7')
    expect(columnKeyOf({ dataIndex: 'name' }, 1)).toBe('name')
    expect(columnKeyOf({ dataIndex: ['owner', 'name'] }, 2)).toBe('owner.name')
    expect(columnKeyOf({ dataIndex: [] }, 3)).toBe('__col_3')
    expect(columnKeyOf({ key: '', dataIndex: '' }, 4)).toBe('__col_4')
  })

  it('nhãn lấy title chữ/số, title dạng VNode thì dùng key; title rỗng là cột tiện ích', () => {
    expect(columnLabelOf({ title: 'Mã xe', key: 'code' }, 0)).toBe('Mã xe')
    expect(columnLabelOf({ title: 2026, key: 'year' }, 0)).toBe('2026')
    expect(columnLabelOf({ title: h('b', 'x'), key: 'code' }, 0)).toBe('code')
    expect(columnLabelOf({ dataIndex: 'brand' }, 0)).toBe('brand')
    expect(columnLabelOf({ title: '', key: 'actions' }, 0)).toBeUndefined()
  })

  it('hasColumnKey: chỉ đúng khi trang khai báo key/dataIndex (key theo vị trí không lưu thiết lập được)', () => {
    expect(hasColumnKey({ key: 'code' })).toBe(true)
    expect(hasColumnKey({ dataIndex: ['owner', 'name'] })).toBe(true)
    expect(hasColumnKey({ key: 0 })).toBe(true)
    expect(hasColumnKey({ title: 'Thao tác' })).toBe(false)
    expect(hasColumnKey({ key: '', dataIndex: [] })).toBe(false)
  })
})

describe('mergePagination', () => {
  it('false giữ nguyên; không cấu hình → mặc định chuẩn AntAdmin', () => {
    expect(mergePagination(false)).toBe(false)
    expect(mergePagination(undefined)).toEqual({ size: 'default', showSizeChanger: true, showTotal: formatTotal })
    expect(formatTotal(351)).toBe('Tổng số dòng 351')
  })

  it('object của trang ghi đè từng key', () => {
    const showTotal = (n: number) => `${n} xe`
    expect(mergePagination({ pageSize: 25, showTotal, size: 'small' })).toEqual({
      size: 'small',
      showSizeChanger: true,
      showTotal,
      pageSize: 25,
    })
  })
})

describe('mergeRowClassName', () => {
  it('gộp chuỗi/hàm của trang với lớp dòng xen kẽ', () => {
    expect(mergeRowClassName('hang', true)({}, 1, 0)).toBe('hang c-table__row--striped')
    expect(mergeRowClassName('hang', true)({}, 2, 0)).toBe('hang')
    expect(mergeRowClassName((_r: unknown, i: number) => `r${i}`, false)({}, 3, 0)).toBe('r3')
    expect(mergeRowClassName(undefined, false)({}, 1, 0)).toBe('')
  })
})
