// Phân loại AppError để tầng UI/layer xử lý nhất quán (toast, redirect, form).
import { toAppError } from './error'

/** 401 — chưa/đã hết đăng nhập. */
export function isAuthError(input: unknown): boolean {
  return toAppError(input).status === 401
}

/** 403 — không đủ quyền. */
export function isForbidden(input: unknown): boolean {
  return toAppError(input).status === 403
}

/** 422 — lỗi validate dữ liệu (thường kèm field errors). */
export function isValidation(input: unknown): boolean {
  return toAppError(input).status === 422
}

/** 5xx — lỗi phía server. */
export function isServerError(input: unknown): boolean {
  const status = toAppError(input).status
  return typeof status === 'number' && status >= 500
}

/** Không có mã HTTP (mất mạng, timeout, lỗi JS chưa bắt…). */
export function isNetworkError(input: unknown): boolean {
  return toAppError(input).status === undefined
}

export type ErrorSeverity = 'info' | 'warning' | 'error'

/** Mức độ nghiêm trọng để chọn kiểu hiển thị (message vs notification). */
export function errorSeverity(input: unknown): ErrorSeverity {
  const err = toAppError(input)
  if (isServerError(err) || isNetworkError(err)) return 'error'
  if (isForbidden(err) || isValidation(err)) return 'warning'
  return 'error'
}

/**
 * Trích field errors từ AppError.data (dạng `{ errors|fields: { field: string|string[] } }`)
 * để gán vào CForm. Trả object rỗng nếu không có.
 */
export function getFieldErrors(input: unknown): Record<string, string[]> {
  const data = toAppError(input).data
  if (!data || typeof data !== 'object') return {}
  const record = data as Record<string, unknown>
  const source = record.errors ?? record.fields
  if (!source || typeof source !== 'object') return {}
  const out: Record<string, string[]> = {}
  for (const [field, value] of Object.entries(source as Record<string, unknown>)) {
    out[field] = Array.isArray(value) ? value.map(String) : [String(value)]
  }
  return out
}
