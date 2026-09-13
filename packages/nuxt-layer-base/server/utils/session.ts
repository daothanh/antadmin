// App sản phẩm typecheck thẳng source layer: tự tham chiếu type Node (@types/node là dependency
// của layer) thay vì trông vào app có cài sẵn hay được hoist.
/// <reference types="node" />
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import type { AuthUser } from '@antadmin/composables'

const SESSION_COOKIE = 'antadmin_session'

// Định dạng cookie: v1.<iv>.<ciphertext>.<tag> (mỗi phần base64url).
// AES-256-GCM cho cả BÍ MẬT (accessToken không lộ) lẫn TOÀN VẸN (chống giả mạo):
// đổi 1 byte → tag không khớp → coi như không có session.
const SEAL_VERSION = 'v1'
const IV_BYTES = 12
const DEV_SECRET = 'antadmin-dev-insecure-session-secret-change-me'

export interface AntAdminSession {
  user: AuthUser
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}

// Cache khoá theo secret để không hash lại mỗi lần seal/unseal.
let cachedSecret: string | undefined
let cachedKey: Buffer | undefined

function deriveKey(secret: string): Buffer {
  if (cachedKey && cachedSecret === secret) return cachedKey
  cachedSecret = secret
  cachedKey = createHash('sha256').update(secret).digest() // 32 bytes
  return cachedKey
}

/** Mã hoá + ký session bằng AES-256-GCM. Hàm thuần (không phụ thuộc h3) → test được. */
export function sealAntAdminSession(session: AntAdminSession, secret: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret), iv)
  const plaintext = Buffer.from(JSON.stringify(session), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    SEAL_VERSION,
    iv.toString('base64url'),
    ciphertext.toString('base64url'),
    tag.toString('base64url'),
  ].join('.')
}

/** Giải mã + xác thực. Trả null nếu sai định dạng / bị giả mạo / sai khoá. */
export function unsealAntAdminSession(raw: string, secret: string): AntAdminSession | null {
  const parts = raw.split('.')
  if (parts.length !== 4 || parts[0] !== SEAL_VERSION) return null
  const [, ivB64, dataB64, tagB64] = parts
  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      deriveKey(secret),
      Buffer.from(ivB64!, 'base64url'),
    )
    decipher.setAuthTag(Buffer.from(tagB64!, 'base64url'))
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(dataB64!, 'base64url')),
      decipher.final(), // ném nếu tag không khớp (bị giả mạo / sai khoá)
    ])
    return JSON.parse(plaintext.toString('utf8')) as AntAdminSession
  } catch {
    return null
  }
}

/**
 * Lấy session secret (runtimeConfig.session.secret, override qua
 * NUXT_SESSION_SECRET). Bắt buộc có ở production; dev cho phép secret tạm + cảnh
 * báo để mock flow chạy được ngay.
 */
function resolveSecret(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const secret = (config.session as { secret?: string } | undefined)?.secret
  if (secret) return secret

  if (!import.meta.dev) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Session secret chưa cấu hình. Đặt NUXT_SESSION_SECRET (>= 32 ký tự).',
    })
  }
  if (cachedSecret !== DEV_SECRET) {
    console.warn(
      '[antadmin] NUXT_SESSION_SECRET chưa đặt — dùng secret DEV không an toàn. ' +
        'Chỉ chấp nhận ở môi trường phát triển.',
    )
  }
  return DEV_SECRET
}

export function getAntAdminSession(event: H3Event): AntAdminSession | null {
  const raw = getCookie(event, SESSION_COOKIE)
  if (!raw) return null
  return unsealAntAdminSession(raw, resolveSecret(event))
}

export function setAntAdminSession(event: H3Event, session: AntAdminSession): void {
  setCookie(event, SESSION_COOKIE, sealAntAdminSession(session, resolveSecret(event)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 60 * 8,
  })
}

export function clearAntAdminSession(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
