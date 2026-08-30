import { message, notification } from 'ant-design-vue'
import {
  isAuthError,
  isForbidden,
  isNetworkError,
  isServerError,
  isValidation,
  toAppError,
} from '@antadmin/utils'
import type { AppError } from '@antadmin/utils'

// Điều phối hiển thị lỗi tập trung (message/notification theo mức độ). Đặt ở
// @antadmin/ui vì phụ thuộc antd. Router-agnostic: nhận callback điều hướng từ layer.
export interface ErrorHandlerHooks {
  /** 401 — thường điều hướng về trang đăng nhập. */
  onAuthError?: (e: AppError) => void
  /** 403 — không đủ quyền. */
  onForbidden?: (e: AppError) => void
  /** Cửa sổ chống lặp toast trùng (ms). Mặc định 3000. */
  dedupeMs?: number
}

export interface HandleErrorOptions {
  /** Không hiển thị UI (chỉ phân loại + gọi hook). */
  silent?: boolean
  /** Thông báo thay thế khi lỗi không có message. */
  fallbackMessage?: string
}

// Nhớ toast gần đây để chống spam khi nhiều request cùng hỏng.
const recent = new Map<string, number>()

/** Xoá bộ nhớ dedupe (dùng cho test). */
export function _resetErrorDedupe(): void {
  recent.clear()
}

export function useErrorHandler(hooks: ErrorHandlerHooks = {}) {
  const dedupeMs = hooks.dedupeMs ?? 3000

  /**
   * Xử lý một lỗi bất kỳ: phân loại → gọi hook (401/403) → hiển thị (trừ 422/silent).
   * Trả về AppError đã chuẩn hoá để caller đọc tiếp (vd field errors cho form).
   */
  function handleError(input: unknown, opts: HandleErrorOptions = {}): AppError {
    const err = toAppError(input)

    if (isAuthError(err)) hooks.onAuthError?.(err)
    if (isForbidden(err)) hooks.onForbidden?.(err)

    // 422 để CForm tự hiển thị field errors → không toast.
    if (isValidation(err) || opts.silent) return err

    const text = err.message || opts.fallbackMessage || 'Đã xảy ra lỗi'
    const key = `${err.status ?? 'net'}:${text}`
    const now = Date.now()
    const last = recent.get(key)
    if (last !== undefined && now - last < dedupeMs) return err
    recent.set(key, now)

    if (isServerError(err) || isNetworkError(err)) {
      notification.error({ message: 'Lỗi hệ thống', description: text })
    } else {
      message.error(text)
    }
    return err
  }

  return { handleError }
}
