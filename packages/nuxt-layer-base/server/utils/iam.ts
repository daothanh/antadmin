import { randomBytes } from 'node:crypto'
import type { AuthClientOption, AuthMethod, AuthUser } from '@antadmin/composables'

// Client cho cổng IAM (đăng nhập form first-party). Endpoint + cách bóc field
// đều lấy từ runtimeConfig.auth → đổi backend chỉ cần đổi env, không sửa code.
// Mặc định khớp IAM AntAdmin (api.antadmin.com/cop).

export interface AuthEndpoints {
  login: string
  userInfo: string
  clients: string
  otpSend: string
}

export interface AuthMapping {
  token: string
  refresh: string
  expiresIn: string
  id: string
  name: string
  email: string
  roles: string
  permissions: string
  // Khi roles/permissions là mảng OBJECT, lấy field nào làm mã. IAM AntAdmin:
  // role → 'code' (AIWSP_ADMIN), permission → 'uri' (/attendance-summary/search).
  roleKey: string
  permissionKey: string
  // Chỉ giữ permission có field `permissionTypeKey` === `permissionType`
  // (IAM AntAdmin: chỉ lấy permission type='web' — dùng gating uri/link/action button).
  // permissionType rỗng → không lọc.
  permissionType: string
  permissionTypeKey: string
}

export interface AuthConfig {
  baseURL: string
  endpoints: AuthEndpoints
  mapping: AuthMapping
  // Map phương thức xác thực → mã authenMethod IAM (google=1 đã xác nhận).
  authenMethod: Record<string, number>
  mock: boolean
}

export interface LoginPayload {
  clientId?: string // IAM dùng CODE (vd WP_HRM), không phải uuid
  username: string
  password: string
  method?: AuthMethod
  otp?: string
  transactionId?: string // trả về từ bước gửi OTP (Telegram)
}

export interface IamTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

const REQUEST_TIMEOUT = 10_000

/** Lấy giá trị theo dot-path ('body.accessToken') — an toàn với null/undefined. */
export function getByPath(source: unknown, path: string): unknown {
  if (!path) return undefined
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, source)
}

// Chuẩn hoá mảng roles/permissions về string[]. Mảng string → giữ nguyên; mảng
// object → lấy field `key` (vd role='code', permission='uri').
export function extractCodes(value: unknown, key: string): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const field = (item as Record<string, unknown>)[key]
        if (typeof field === 'string') return field
      }
      return ''
    })
    .filter((item): item is string => item.length > 0)
}

/** Lọc mảng permission object theo type (vd chỉ 'web'). type rỗng → không lọc. */
export function filterByType(value: unknown, type: string, typeKey: string): unknown[] {
  if (!Array.isArray(value)) return []
  if (!type) return value
  return value.filter(
    (item) =>
      item && typeof item === 'object' && (item as Record<string, unknown>)[typeKey] === type,
  )
}

/** Bóc claims (userinfo response) → AuthUser theo mapping. Hàm thuần → test được. */
export function mapIamUser(response: unknown, mapping: AuthMapping): AuthUser {
  const rawPerms = filterByType(
    getByPath(response, mapping.permissions),
    mapping.permissionType,
    mapping.permissionTypeKey,
  )
  return {
    id: String(getByPath(response, mapping.id) ?? ''),
    name: (getByPath(response, mapping.name) as string) || undefined,
    email: (getByPath(response, mapping.email) as string) || undefined,
    roles: extractCodes(getByPath(response, mapping.roles), mapping.roleKey),
    permissions: extractCodes(rawPerms, mapping.permissionKey),
  }
}

/** Bóc token từ login response theo mapping. Hàm thuần → test được. */
export function mapIamTokens(response: unknown, mapping: AuthMapping): IamTokens {
  const accessToken = getByPath(response, mapping.token)
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('IAM không trả accessToken (kiểm tra auth.mapping.token).')
  }
  const refresh = getByPath(response, mapping.refresh)
  // expires_in có thể là số hoặc chuỗi ("86400") tuỳ IAM → ép về số.
  const expiresIn = Number(getByPath(response, mapping.expiresIn))
  return {
    accessToken,
    refreshToken: typeof refresh === 'string' && refresh ? refresh : undefined,
    expiresAt: Number.isFinite(expiresIn) && expiresIn > 0 ? Date.now() + expiresIn * 1000 : undefined,
  }
}

function ensureBaseURL(config: AuthConfig): string {
  if (!config.baseURL) {
    throw createError({ statusCode: 500, statusMessage: 'auth.baseURL chưa cấu hình (NUXT_AUTH_BASE_URL).' })
  }
  return config.baseURL.replace(/\/$/, '')
}

function url(config: AuthConfig, path: string): string {
  return `${ensureBaseURL(config)}${path}`
}

// IAM trả envelope { code, message }. code khác 'API000' là lỗi nghiệp vụ (vd sai
// mật khẩu/OTP) dù HTTP 200 → ném 401 kèm message tiếng Việt cho form hiển thị.
function assertOk(res: unknown): void {
  if (res && typeof res === 'object') {
    const code = (res as Record<string, unknown>).code
    if (typeof code === 'string' && code !== 'API000') {
      const message = (res as Record<string, unknown>).message
      throw createError({
        statusCode: 401,
        statusMessage: typeof message === 'string' ? message : 'Đăng nhập thất bại.',
      })
    }
  }
}

/** Đổi credential lấy token (login-v1). Ném 401 nếu IAM từ chối (sai mật khẩu/OTP). */
export async function iamLogin(config: AuthConfig, payload: LoginPayload): Promise<IamTokens> {
  const authenMethod = config.authenMethod[payload.method ?? 'google'] ?? 1
  // Field thiết bị: IAM yêu cầu nhưng không ràng buộc giá trị → sinh mặc định.
  const body = {
    username: payload.username,
    password: payload.password,
    clientId: payload.clientId,
    otp: payload.otp ?? '',
    authenMethod,
    transactionId: payload.transactionId ?? null,
    isSecure: false,
    deviceType: '1',
    deviceName: 'Web',
    deviceInfo: 'BFF',
    deviceId: randomBytes(16).toString('hex'),
    deviceUuid: randomBytes(16).toString('hex'),
    socketId: '',
  }
  const res = await $fetch<unknown>(url(config, config.endpoints.login), {
    method: 'POST',
    timeout: REQUEST_TIMEOUT,
    body,
  })
  assertOk(res)
  return mapIamTokens(res, config.mapping)
}

/**
 * Lấy thông tin người dùng bằng accessToken. IAM AntAdmin: POST, header
 * `authorization: <token>` (KHÔNG có Bearer), body rỗng.
 */
export async function fetchUserInfo(config: AuthConfig, accessToken: string): Promise<AuthUser> {
  const res = await $fetch<unknown>(url(config, config.endpoints.userInfo), {
    method: 'POST',
    headers: { authorization: accessToken },
    timeout: REQUEST_TIMEOUT,
  })
  assertOk(res)
  return mapIamUser(res, config.mapping)
}

interface RawClient {
  id?: string
  code?: string
  name?: string | null
  url?: string | null
}

/** Danh sách ứng dụng cho dropdown — chỉ giữ client có tên (bỏ client hệ thống). */
export async function fetchClients(config: AuthConfig): Promise<AuthClientOption[]> {
  if (!config.endpoints.clients) return []
  const res = await $fetch<{ body?: RawClient[] } | RawClient[]>(
    url(config, config.endpoints.clients),
    { timeout: REQUEST_TIMEOUT },
  )
  const list = Array.isArray(res) ? res : (res.body ?? [])
  return list
    .filter((c): c is RawClient & { id: string; code: string; name: string } =>
      Boolean(c.id && c.code && c.name),
    )
    .map((c) => ({ id: c.id, code: c.code, name: c.name, url: c.url ?? undefined }))
}

/**
 * Gửi OTP (Telegram) trước khi đăng nhập — login/request. Trả transactionId để
 * gửi kèm bước login. Google Authenticator KHÔNG cần bước này.
 */
export async function sendOtp(
  config: AuthConfig,
  payload: { username: string; password: string; clientId?: string },
): Promise<{ transactionId?: string }> {
  if (!config.endpoints.otpSend) {
    throw createError({ statusCode: 400, statusMessage: 'Chưa cấu hình gửi OTP (auth.endpoints.otpSend).' })
  }
  const res = await $fetch<unknown>(url(config, config.endpoints.otpSend), {
    method: 'POST',
    timeout: REQUEST_TIMEOUT,
    body: { ...payload, isSecure: false },
  })
  assertOk(res)
  const transactionId = getByPath(res, 'body.transactionId') ?? getByPath(res, 'body')
  return { transactionId: typeof transactionId === 'string' ? transactionId : undefined }
}
