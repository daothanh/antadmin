// Hợp đồng auth — abstract để cắm provider (OIDC mặc định, SAML/cổng riêng sau).

export interface AuthUser {
  id: string
  name?: string
  email?: string
  roles: string[]
  permissions: string[]
  [key: string]: unknown
}

/** Phương thức sinh/gửi OTP hỗ trợ trên form đăng nhập. */
export type AuthMethod = 'google' | 'telegram'

/** Một ứng dụng (client) người dùng chọn khi đăng nhập. */
export interface AuthClientOption {
  id: string
  code: string
  name: string
  url?: string
}

/** Thông tin đăng nhập form gửi lên BFF (password/OTP KHÔNG bao giờ lưu ở client). */
export interface LoginCredentials {
  clientId?: string // IAM dùng CODE ứng dụng (vd WP_HRM), không phải uuid
  username: string
  password: string
  method?: AuthMethod
  otp?: string
  transactionId?: string // trả về từ bước gửi OTP (Telegram)
}

export interface AuthProvider {
  /** Khởi động flow đăng nhập (redirect tới trang login / IdP). */
  login(redirectTo?: string): Promise<void> | void
  /**
   * Đăng nhập bằng credential qua BFF (form first-party). Trả user nếu thành
   * công, ném lỗi nếu sai. Provider không hỗ trợ form có thể bỏ trống.
   */
  loginWithPassword?(credentials: LoginCredentials): Promise<AuthUser>
  /** Đăng xuất + dọn session. */
  logout(redirectTo?: string): Promise<void> | void
  /** Xử lý callback sau khi IdP redirect về, trả user nếu thành công. */
  handleCallback(): Promise<AuthUser | null>
  /** Làm mới phiên (token refresh). Trả true nếu còn phiên hợp lệ. */
  refresh(): Promise<boolean>
  /** Lấy user hiện tại (từ session/cookie). */
  getUser(): Promise<AuthUser | null>
}
