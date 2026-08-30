// Chỉ cho phép redirect NỘI BỘ (đường dẫn tương đối cùng origin) để chống
// open redirect: `/auth/login?redirect=https://evil.com` phải bị vô hiệu hoá.
//
// Hợp lệ: bắt đầu bằng đúng một '/', không phải '//' hay '/\' (protocol-relative
// hoặc backslash-trick mà trình duyệt hiểu thành host khác).
export function sanitizeRedirect(target: unknown, fallback = '/'): string {
  if (typeof target !== 'string' || target.length === 0) return fallback
  if (target[0] !== '/') return fallback
  if (target[1] === '/' || target[1] === '\\') return fallback
  return target
}
