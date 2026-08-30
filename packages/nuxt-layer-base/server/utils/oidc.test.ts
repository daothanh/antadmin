import { describe, expect, it } from 'vitest'
import { mapUserInfo } from './oidc'

describe('mapUserInfo', () => {
  it('map claims đầy đủ', () => {
    const user = mapUserInfo({
      sub: 'abc',
      name: 'Nguyễn A',
      email: 'a@antadmin.vn',
      roles: ['admin', 'user'],
      permissions: ['order.read', 'order.write'],
    })
    expect(user).toEqual({
      id: 'abc',
      name: 'Nguyễn A',
      email: 'a@antadmin.vn',
      roles: ['admin', 'user'],
      permissions: ['order.read', 'order.write'],
    })
  })

  it('roles/permissions về mảng rỗng khi claim thiếu hoặc sai kiểu', () => {
    const user = mapUserInfo({ sub: '1', roles: 'admin', permissions: null })
    expect(user.roles).toEqual([])
    expect(user.permissions).toEqual([])
  })

  it('id là chuỗi rỗng khi thiếu sub; name/email undefined nếu sai kiểu', () => {
    const user = mapUserInfo({ name: 123, email: {} })
    expect(user.id).toBe('')
    expect(user.name).toBeUndefined()
    expect(user.email).toBeUndefined()
  })
})
