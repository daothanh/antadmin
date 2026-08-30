import { describe, expect, it } from 'vitest'
import { sealAntAdminSession, unsealAntAdminSession, type AntAdminSession } from './session'

const SECRET = 'test-secret-at-least-32-characters-long!!'

const session: AntAdminSession = {
  user: {
    id: 'u1',
    name: 'Người dùng',
    email: 'u1@antadmin.vn',
    roles: ['admin'],
    permissions: ['order.read'],
  },
  accessToken: 'access-abc',
  refreshToken: 'refresh-xyz',
  expiresAt: 1_700_000_000_000,
}

describe('seal/unseal session', () => {
  it('roundtrip khôi phục đúng dữ liệu', () => {
    const sealed = sealAntAdminSession(session, SECRET)
    expect(sealed.startsWith('v1.')).toBe(true)
    expect(unsealAntAdminSession(sealed, SECRET)).toEqual(session)
  })

  it('mỗi lần seal ra ciphertext khác nhau (IV ngẫu nhiên)', () => {
    expect(sealAntAdminSession(session, SECRET)).not.toBe(sealAntAdminSession(session, SECRET))
  })

  it('không giải mã được với secret khác', () => {
    const sealed = sealAntAdminSession(session, SECRET)
    expect(unsealAntAdminSession(sealed, 'secret-khac-hoan-toan-3232323232323232')).toBeNull()
  })

  it('phát hiện giả mạo (đổi 1 ký tự ciphertext) → null', () => {
    const sealed = sealAntAdminSession(session, SECRET)
    const parts = sealed.split('.')
    // Lật 1 ký tự trong ciphertext.
    const c = parts[2]!
    parts[2] = (c[0] === 'A' ? 'B' : 'A') + c.slice(1)
    expect(unsealAntAdminSession(parts.join('.'), SECRET)).toBeNull()
  })

  it('từ chối định dạng lạ / phiên bản khác', () => {
    expect(unsealAntAdminSession('không-phải-định-dạng', SECRET)).toBeNull()
    expect(unsealAntAdminSession('v2.a.b.c', SECRET)).toBeNull()
    // Base64 thuần (định dạng CŨ) không còn được chấp nhận.
    expect(unsealAntAdminSession(Buffer.from('{}').toString('base64url'), SECRET)).toBeNull()
  })
})
