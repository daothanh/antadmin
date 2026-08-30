import { describe, expect, it } from 'vitest'
import { createPermissionChecker, normalizeUri, parseSuperRoles } from './permission'

describe('normalizeUri', () => {
  it('cắt query + bỏ dấu / cuối', () => {
    expect(normalizeUri('/a/b/')).toBe('/a/b')
    expect(normalizeUri('/a/b?x=1')).toBe('/a/b')
    expect(normalizeUri('/')).toBe('/')
  })
})

describe('parseSuperRoles', () => {
  it('nhận chuỗi hoặc mảng', () => {
    expect(parseSuperRoles({ superRoles: 'A, B ,' })).toEqual(['A', 'B'])
    expect(parseSuperRoles({ superRoles: ['X'] })).toEqual(['X'])
    expect(parseSuperRoles({})).toEqual([])
    expect(parseSuperRoles(undefined)).toEqual([])
  })
})

describe('createPermissionChecker', () => {
  const c = createPermissionChecker(['/attendance/search/', '/attendance/edit'], ['NV'], ['ADMIN'])

  it('can: exact match sau normalize', () => {
    expect(c.can('/attendance/search')).toBe(true)
    expect(c.can('/attendance/search?x=1')).toBe(true)
    expect(c.can('/attendance/delete')).toBe(false)
  })

  it('canAll/canAny', () => {
    expect(c.canAll(['/attendance/search', '/attendance/edit'])).toBe(true)
    expect(c.canAll(['/attendance/search', '/attendance/delete'])).toBe(false)
    expect(c.canAny(['/attendance/delete', '/attendance/edit'])).toBe(true)
  })

  it('hasRole/hasAnyRole', () => {
    expect(c.hasRole('NV')).toBe(true)
    expect(c.hasAnyRole(['X', 'NV'])).toBe(true)
    expect(c.hasAnyRole(['X'])).toBe(false)
  })

  it('super-role bỏ qua mọi check', () => {
    const su = createPermissionChecker([], ['ADMIN'], ['ADMIN'])
    expect(su.can('/bat/ky')).toBe(true)
  })

  it('filterByPermission: bỏ item thiếu quyền, giữ item không khai, đệ quy children', () => {
    const items = [
      { label: 'công khai' },
      { label: 'search', permission: '/attendance/search' },
      { label: 'delete', permission: '/attendance/delete' },
      {
        label: 'cha',
        children: [
          { label: 'con-ok', permission: '/attendance/edit' },
          { label: 'con-no', permission: '/attendance/delete' },
        ],
      },
    ]
    const out = c.filterByPermission(items)
    expect(out.map((i) => i.label)).toEqual(['công khai', 'search', 'cha'])
    expect(out[2]!.children!.map((i) => i.label)).toEqual(['con-ok'])
  })
})
