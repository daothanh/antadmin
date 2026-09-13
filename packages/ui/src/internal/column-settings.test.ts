import { describe, expect, it } from 'vitest'
import {
  canControlSort,
  defaultSortOf,
  displayColumnsOf,
  isDefaultTableSettings,
  isSameTableSort,
  mergeColumnOrder,
  mergeSortOrder,
  mergeTableSettings,
  moveColumn,
  pinOf,
  settingColumnsOf,
  sortColumnOf,
  sortFieldOf,
  toTableSort,
} from './column-settings'
import type { SettingColumn } from './column-settings'
import type { TableColumnLike } from './table'

// Cột kiểu trang danh sách: STT cố định trái, 2 cột sắp xếp được, cột ⋮ tiện ích cố định phải.
const COLUMNS = [
  { title: 'STT', key: 'index', fixed: 'left' },
  { title: 'Mã', dataIndex: 'code', key: 'code', sorter: true },
  { title: 'Tên', dataIndex: 'name', sorter: true },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
  { title: '', key: 'actions', fixed: 'right' },
]
const SETTING_COLUMNS = settingColumnsOf(COLUMNS)

function plainColumns(...keys: string[]): SettingColumn[] {
  return keys.map((key) => ({ key, label: key.toUpperCase(), pin: 'none', sortField: null }))
}

describe('settingColumnsOf / pinOf / sortFieldOf', () => {
  it('bỏ cột tiện ích, lấy key/nhãn/nhóm cố định/field sắp xếp theo thứ tự khai báo', () => {
    expect(SETTING_COLUMNS).toEqual([
      { key: 'index', label: 'STT', pin: 'left', sortField: null },
      { key: 'code', label: 'Mã', pin: 'none', sortField: 'code' },
      { key: 'name', label: 'Tên', pin: 'none', sortField: 'name' },
      { key: 'status', label: 'Trạng thái', pin: 'none', sortField: null },
    ])
  })

  it('fixed true là trái; field sắp xếp từ dataIndex chuỗi/số, mảng/rỗng hoặc không sorter → null', () => {
    expect(pinOf({ fixed: true })).toBe('left')
    expect(pinOf({ fixed: 'right' })).toBe('right')
    expect(pinOf({ fixed: false })).toBe('none')
    expect(sortFieldOf({ sorter: true, dataIndex: 0 })).toBe('0')
    expect(sortFieldOf({ sorter: () => 0, dataIndex: ['owner', 'name'] })).toBeNull()
    expect(sortFieldOf({ sorter: true, dataIndex: '' })).toBeNull()
    expect(sortFieldOf({ dataIndex: 'code' })).toBeNull()
  })
})

describe('mergeColumnOrder', () => {
  it('theo thứ tự đã lưu, bỏ key không còn và key lặp; rỗng → thứ tự khai báo', () => {
    const columns = plainColumns('a', 'b', 'c')
    expect(mergeColumnOrder(columns, ['c', 'x', 'b', 'c', 'a'])).toEqual(['c', 'b', 'a'])
    expect(mergeColumnOrder(columns, [])).toEqual(['a', 'b', 'c'])
  })

  it('cột mới chèn ngay sau cột đứng trước nó trong columns; cột mới đứng đầu thì lên đầu', () => {
    expect(mergeColumnOrder(plainColumns('x', 'a', 'b', 'y', 'c'), ['c', 'b', 'a'])).toEqual([
      'x',
      'c',
      'b',
      'y',
      'a',
    ])
  })

  it('cột cố định luôn nằm trong nhóm của nó dù thứ tự lưu đặt sai', () => {
    const columns: SettingColumn[] = [
      { key: 'l', label: 'L', pin: 'left', sortField: null },
      ...plainColumns('a'),
      { key: 'r', label: 'R', pin: 'right', sortField: null },
      ...plainColumns('b'),
    ]
    expect(mergeColumnOrder(columns, [])).toEqual(['l', 'a', 'b', 'r'])
    expect(mergeColumnOrder(columns, ['r', 'b', 'a', 'l'])).toEqual(['l', 'b', 'a', 'r'])
  })
})

describe('mergeTableSettings / isDefaultTableSettings / isSameTableSort', () => {
  it('chưa có thiết lập → cấu hình gốc', () => {
    const settings = mergeTableSettings(SETTING_COLUMNS, null)
    expect(settings).toEqual({ columnOrder: [], hiddenColumns: [], defaultSort: null })
    expect(isDefaultTableSettings(settings)).toBe(true)
  })

  it('thứ tự trùng gốc → [], cột ẩn theo thứ tự hiển thị và bỏ key không còn', () => {
    const settings = mergeTableSettings(SETTING_COLUMNS, {
      columnOrder: ['index', 'code', 'name', 'status'],
      hiddenColumns: ['status', 'gone', 'code'],
      defaultSort: null,
    })
    expect(settings).toEqual({ columnOrder: [], hiddenColumns: ['code', 'status'], defaultSort: null })
    expect(isDefaultTableSettings(settings)).toBe(false)
    const reordered = ['index', 'name', 'code', 'status']
    expect(
      mergeTableSettings(SETTING_COLUMNS, { columnOrder: reordered, hiddenColumns: [], defaultSort: null })
        .columnOrder,
    ).toEqual(reordered)
  })

  it('mọi cột đều ẩn → hiện lại cột đầu tiên theo thứ tự hiển thị', () => {
    const settings = mergeTableSettings(SETTING_COLUMNS, {
      columnOrder: ['name', 'code', 'status'],
      hiddenColumns: ['index', 'name', 'code', 'status'],
      defaultSort: null,
    })
    expect(settings.hiddenColumns).toEqual(['name', 'code', 'status'])
    expect(mergeTableSettings([], { columnOrder: ['a'], hiddenColumns: ['a'], defaultSort: null })).toEqual({
      columnOrder: [],
      hiddenColumns: [],
      defaultSort: null,
    })
  })

  it('defaultSort chỉ giữ khi field thuộc cột sắp xếp được (object mới)', () => {
    const defaultSort = { field: 'name', order: 'descend' as const }
    const kept = mergeTableSettings(SETTING_COLUMNS, { columnOrder: [], hiddenColumns: [], defaultSort })
    expect(kept.defaultSort).toEqual(defaultSort)
    expect(kept.defaultSort).not.toBe(defaultSort)
    for (const field of ['status', 'gone']) {
      const settings = { columnOrder: [], hiddenColumns: [], defaultSort: { field, order: 'ascend' as const } }
      expect(mergeTableSettings(SETTING_COLUMNS, settings).defaultSort).toBeNull()
    }
  })

  it('isSameTableSort so field + chiều; null chỉ bằng null', () => {
    expect(isSameTableSort(null, null)).toBe(true)
    expect(isSameTableSort({ field: 'a', order: 'ascend' }, { field: 'a', order: 'ascend' })).toBe(true)
    expect(isSameTableSort({ field: 'a', order: 'ascend' }, { field: 'a', order: 'descend' })).toBe(false)
    expect(isSameTableSort({ field: 'a', order: 'ascend' }, { field: 'b', order: 'ascend' })).toBe(false)
    expect(isSameTableSort({ field: 'a', order: 'ascend' }, null)).toBe(false)
  })
})

describe('displayColumnsOf', () => {
  it('xếp cột theo thiết lập, cột tiện ích giữ vị trí, bỏ cột ẩn; không sửa mảng gốc', () => {
    const snapshot = [...COLUMNS]
    const columns = displayColumnsOf(COLUMNS, {
      columnOrder: ['index', 'status', 'name', 'code'],
      hiddenColumns: ['name'],
      defaultSort: null,
    })
    expect(columns).toEqual([COLUMNS[0], COLUMNS[3], COLUMNS[1], COLUMNS[4]])
    expect(COLUMNS).toEqual(snapshot)
    const untouched = displayColumnsOf(COLUMNS, { columnOrder: [], hiddenColumns: [], defaultSort: null })
    expect(untouched).toEqual(COLUMNS)
    expect(untouched).not.toBe(COLUMNS)
  })

  it('cột tiện ích ở giữa đứng yên; cột không key dùng key theo vị trí', () => {
    const columns = [{ title: 'A', key: 'a' }, { title: '', key: 'menu' }, { title: 'Không key' }]
    const settings = { columnOrder: ['__col_2', 'a'], hiddenColumns: [], defaultSort: null }
    expect(displayColumnsOf(columns, settings)).toEqual([columns[2], columns[1], columns[0]])
  })

  it('trang khai báo trùng key → các cột trùng đi liền nhau, không mất cột', () => {
    const columns = [
      { title: 'A', key: 'a' },
      { title: 'A2', key: 'a' },
      { title: 'B', key: 'b' },
    ]
    const settings = { columnOrder: ['b', 'a'], hiddenColumns: [], defaultSort: null }
    expect(displayColumnsOf(columns, settings)).toEqual([columns[2], columns[0], columns[1]])
  })
})

describe('moveColumn', () => {
  it('chuyển cột tới vị trí đích (lấy chỗ của cột đang ở đó), trả mảng mới', () => {
    const columns = plainColumns('a', 'b', 'c', 'd')
    const order = ['a', 'b', 'c', 'd']
    expect(moveColumn(order, 'a', 2, columns)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveColumn(order, 'd', 1, columns)).toEqual(['a', 'd', 'b', 'c'])
    expect(order).toEqual(['a', 'b', 'c', 'd'])
  })

  it('giới hạn trong nhóm cố định; key không có trong thứ tự → giữ nguyên', () => {
    const columns: SettingColumn[] = [
      { key: 'l1', label: 'L1', pin: 'left', sortField: null },
      { key: 'l2', label: 'L2', pin: 'left', sortField: null },
      ...plainColumns('a', 'b'),
      { key: 'r', label: 'R', pin: 'right', sortField: null },
    ]
    const order = ['l1', 'l2', 'a', 'b', 'r']
    expect(moveColumn(order, 'a', 0, columns)).toEqual(order)
    expect(moveColumn(order, 'a', 4, columns)).toEqual(['l1', 'l2', 'b', 'a', 'r'])
    expect(moveColumn(order, 'l1', 4, columns)).toEqual(['l2', 'l1', 'a', 'b', 'r'])
    expect(moveColumn(order, 'r', 0, columns)).toEqual(order)
    const copy = moveColumn(order, 'x', 1, columns)
    expect(copy).toEqual(order)
    expect(copy).not.toBe(order)
  })
})

describe('điều khiển sortOrder', () => {
  it('canControlSort: có cột sorter có field, trang chưa tự điều khiển, không nhiều cột, không cột nhóm', () => {
    expect(canControlSort(COLUMNS)).toBe(true)
    expect(canControlSort([{ title: 'Mã', dataIndex: 'code' }])).toBe(false)
    expect(canControlSort([{ dataIndex: 'code', sorter: true, sortOrder: null }])).toBe(false)
    expect(canControlSort([{ dataIndex: 'code', sorter: true }, { title: 'Nhóm', children: [] }])).toBe(false)
    expect(canControlSort([{ dataIndex: ['owner', 'name'], sorter: true }])).toBe(false)
    expect(canControlSort([{ dataIndex: 'code', sorter: { multiple: 1 } }])).toBe(false)
    expect(canControlSort([{ dataIndex: 'code', sorter: { compare: () => 0 } }])).toBe(true)
  })

  it('mergeSortOrder gắn sortOrder cho cột sorter theo sắp xếp, cột khác giữ nguyên object', () => {
    const columns: TableColumnLike[] = [
      { dataIndex: 'code', sorter: true },
      { dataIndex: 'name', sorter: true },
      { dataIndex: 'status' },
    ]
    const sorted = mergeSortOrder(columns, { field: 'name', order: 'descend' })
    expect(sorted).toEqual([
      { dataIndex: 'code', sorter: true, sortOrder: null },
      { dataIndex: 'name', sorter: true, sortOrder: 'descend' },
      { dataIndex: 'status' },
    ])
    expect(sorted[2]).toBe(columns[2])
    expect(mergeSortOrder(columns, null).map((column) => column.sortOrder)).toEqual([null, null, undefined])
  })

  it('defaultSortOf lấy defaultSortOrder hợp lệ đầu tiên của cột sắp xếp được', () => {
    expect(
      defaultSortOf([
        { dataIndex: 'code', defaultSortOrder: 'ascend' },
        { dataIndex: 'name', sorter: true, defaultSortOrder: 'up' },
        { dataIndex: 'updatedAt', sorter: true, defaultSortOrder: 'descend' },
      ]),
    ).toEqual({ field: 'updatedAt', order: 'descend' })
    expect(defaultSortOf(COLUMNS)).toBeNull()
  })

  it('sortColumnOf tìm cột theo field; toTableSort đọc sorter a-table phát ra', () => {
    expect(sortColumnOf(COLUMNS, { field: 'name', order: 'ascend' })).toBe(COLUMNS[2])
    expect(sortColumnOf(COLUMNS, { field: 'status', order: 'ascend' })).toBeUndefined()
    expect(toTableSort({ field: 'name', order: 'ascend', columnKey: 'name' })).toEqual({
      field: 'name',
      order: 'ascend',
    })
    expect(toTableSort({ field: 3, order: 'descend' })).toEqual({ field: '3', order: 'descend' })
    for (const sorter of [
      { field: 'name', order: null },
      { field: ['owner', 'name'], order: 'ascend' },
      [{ field: 'name', order: 'ascend' }],
      {},
      undefined,
    ]) {
      expect(toTableSort(sorter)).toBeNull()
    }
  })
})
