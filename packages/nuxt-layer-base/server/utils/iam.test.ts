import { describe, expect, it } from 'vitest'
import { getByPath, mapIamTokens, mapIamUser, type AuthMapping } from './iam'

const mapping: AuthMapping = {
  token: 'body.accessToken',
  refresh: 'body.refreshToken',
  expiresIn: 'body.expiresIn',
  id: 'body.id',
  name: 'body.fullName',
  email: 'body.email',
  roles: 'body.roles',
  permissions: 'body.permissions',
  roleKey: 'code',
  permissionKey: 'uri',
  permissionType: 'web',
  permissionTypeKey: 'type',
}

describe('getByPath', () => {
  it('lấy giá trị lồng theo dot-path', () => {
    expect(getByPath({ body: { accessToken: 'tk' } }, 'body.accessToken')).toBe('tk')
  })

  it('trả undefined khi path không tồn tại / gặp null', () => {
    expect(getByPath({ body: null }, 'body.accessToken')).toBeUndefined()
    expect(getByPath({}, 'a.b.c')).toBeUndefined()
    expect(getByPath({ body: {} }, '')).toBeUndefined()
  })
})

describe('mapIamUser', () => {
  it('map userinfo envelope → AuthUser', () => {
    const user = mapIamUser(
      {
        body: {
          id: 'u1',
          fullName: 'Nguyễn A',
          email: 'a@antadmin.vn',
          roles: ['admin'],
          permissions: [{ uri: 'order.read', type: 'web' }],
        },
      },
      mapping,
    )
    expect(user).toEqual({
      id: 'u1',
      name: 'Nguyễn A',
      email: 'a@antadmin.vn',
      roles: ['admin'],
      permissions: ['order.read'],
    })
  })

  it('roles theo roleKey=code, permissions theo permissionKey=uri', () => {
    const user = mapIamUser(
      {
        body: {
          id: 1,
          roles: [{ code: 'ADMIN' }, 'user'],
          permissions: [
            { rsCode: 'J.31_Xem', uri: '/attendance/search', type: 'web' },
            { rsCode: 'K.01_Sửa', uri: '/attendance/edit', type: 'web' },
            { rsCode: 'API.01', uri: '/api/attendance', type: 'api' },
          ],
        },
      },
      mapping,
    )
    expect(user.id).toBe('1')
    expect(user.name).toBeUndefined()
    expect(user.roles).toEqual(['ADMIN', 'user'])
    // Chỉ lấy type='web', lấy uri (KHÔNG phải rsCode); bỏ type='api'.
    expect(user.permissions).toEqual(['/attendance/search', '/attendance/edit'])
  })
})

describe('mapIamTokens', () => {
  it('bóc token + tính expiresAt từ expiresIn', () => {
    const before = Date.now()
    const tokens = mapIamTokens(
      { body: { accessToken: 'at', refreshToken: 'rt', expiresIn: 3600 } },
      mapping,
    )
    expect(tokens.accessToken).toBe('at')
    expect(tokens.refreshToken).toBe('rt')
    expect(tokens.expiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000)
  })

  it('ném lỗi khi thiếu accessToken', () => {
    expect(() => mapIamTokens({ body: {} }, mapping)).toThrow()
  })
})
