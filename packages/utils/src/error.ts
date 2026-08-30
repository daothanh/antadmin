// Lỗi chuẩn hoá của framework — mọi lỗi API/nghiệp vụ quy về AppError
// để UI xử lý nhất quán (toast, redirect 401...).

export interface AppErrorOptions {
  status?: number
  code?: string
  data?: unknown
  cause?: unknown
}

export class AppError extends Error {
  readonly status?: number
  readonly code?: string
  readonly data?: unknown

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'AppError'
    this.status = options.status
    this.code = options.code
    this.data = options.data
  }
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.message === 'string') return record.message
    if (typeof record.error === 'string') return record.error
  }
  return fallback
}

/**
 * Chuẩn hoá bất kỳ giá trị lỗi nào (ofetch response error, Error, string...)
 * thành AppError.
 */
export function toAppError(input: unknown): AppError {
  if (input instanceof AppError) return input

  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>
    const status = typeof obj.status === 'number' ? obj.status : undefined
    const data = obj._data ?? obj.data
    const statusText = typeof obj.statusText === 'string' ? obj.statusText : undefined
    const baseMessage =
      input instanceof Error ? input.message : statusText ?? 'Đã xảy ra lỗi không xác định'
    const message = extractMessage(data, baseMessage)
    return new AppError(message, { status, data, cause: input })
  }

  if (typeof input === 'string') {
    return new AppError(input)
  }

  return new AppError('Đã xảy ra lỗi không xác định', { cause: input })
}

export function isAppError(input: unknown): input is AppError {
  return input instanceof AppError
}
