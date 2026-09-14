// App sản phẩm typecheck thẳng source layer: tự tham chiếu type Node (@types/node là dependency
// của layer) thay vì trông vào app có cài sẵn hay được hoist.
/// <reference types="node" />
import { createHash, randomBytes } from 'node:crypto'
import type { AuthUser } from '@antadmin/composables'

export interface OidcMetadata {
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  end_session_endpoint?: string
}

const metadataCache = new Map<string, OidcMetadata>()

export async function getOidcMetadata(issuer: string): Promise<OidcMetadata> {
  const key = issuer.replace(/\/$/, '')
  const cached = metadataCache.get(key)
  if (cached) return cached
  // Timeout để IdP treo không kéo theo request logout/proxy treo vô hạn.
  const metadata = await $fetch<OidcMetadata>(
    `${key}/.well-known/openid-configuration`,
    { timeout: 10_000 },
  )
  metadataCache.set(key, metadata)
  return metadata
}

export function generatePkce(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}

export function randomState(): string {
  return randomBytes(16).toString('base64url')
}

export interface OidcTokenResponse {
  access_token: string
  id_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

export interface OidcClientConfig {
  issuer: string
  clientId: string
  clientSecret: string
}

/**
 * Đổi refresh_token lấy access_token mới (refresh_token grant). Ném lỗi nếu IdP
 * từ chối (token hết hạn/thu hồi) — caller nên coi như phiên đã hết.
 */
export async function refreshAccessToken(
  oidc: OidcClientConfig,
  refreshToken: string,
): Promise<OidcTokenResponse> {
  const metadata = await getOidcMetadata(oidc.issuer)
  return $fetch<OidcTokenResponse>(metadata.token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    timeout: 10_000,
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: oidc.clientId,
      client_secret: oidc.clientSecret,
    }).toString(),
  })
}

// Map claims từ userinfo endpoint sang AuthUser. Tên claim roles/permissions
// có thể khác tuỳ IdP — điều chỉnh tại đây khi tích hợp thật.
export function mapUserInfo(claims: Record<string, unknown>): AuthUser {
  const roles = Array.isArray(claims.roles) ? (claims.roles as string[]) : []
  const permissions = Array.isArray(claims.permissions)
    ? (claims.permissions as string[])
    : []
  return {
    id: String(claims.sub ?? ''),
    name: typeof claims.name === 'string' ? claims.name : undefined,
    email: typeof claims.email === 'string' ? claims.email : undefined,
    roles,
    permissions,
  }
}
