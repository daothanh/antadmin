import { useRequestFetch, useRuntimeConfig } from 'nuxt/app'
import type { FetchOptions } from 'ofetch'
import { toAppError } from '@antadmin/utils'

export interface UseApiOptions {
  /** Ghi đè baseURL (mặc định lấy từ runtimeConfig.public.apiBaseURL hoặc '/api'). */
  baseURL?: string
}

export type ApiFetch = <T = unknown>(request: string, options?: FetchOptions) => Promise<T>

/**
 * $fetch đã cấu hình sẵn cho framework:
 * - baseURL từ runtimeConfig (mô hình BFF: mặc định '/api' proxy qua Nitro)
 * - SSR-aware: forward cookie/header của request đến (useRequestFetch)
 * - chuẩn hoá lỗi về AppError
 *
 * Refresh token / 401 chủ yếu xử lý phía Nitro BFF (xem @antadmin/nuxt-layer-base);
 * ở client, 401 được ném ra dưới dạng AppError để middleware/caller xử lý.
 */
export function useApi(options: UseApiOptions = {}): ApiFetch {
  const publicConfig = useRuntimeConfig().public as { apiBaseURL?: string }
  const baseURL = options.baseURL ?? publicConfig.apiBaseURL ?? '/api'

  // useRequestFetch trả $fetch forward header khi chạy SSR (union không có .create
  // nên ta bọc lại thay vì dùng .create).
  const requestFetch = useRequestFetch()

  return <T = unknown>(request: string, opts: FetchOptions = {}) =>
    (requestFetch as (req: string, o: FetchOptions) => Promise<T>)(request, {
      baseURL,
      ...opts,
      onResponseError(context) {
        throw toAppError(context.response)
      },
      onRequestError(context) {
        throw toAppError(context.error)
      },
    })
}
