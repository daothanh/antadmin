import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchOptions } from 'ofetch'

const mocks = vi.hoisted(() => ({
  runtimeConfig: { public: {} as { apiBaseURL?: string } },
  requestFetch: vi.fn(),
}))

vi.mock('nuxt/app', () => ({
  useRuntimeConfig: () => mocks.runtimeConfig,
  useRequestFetch: () => mocks.requestFetch,
}))

import { useApi } from './useApi'

/** Lấy options mà useApi đã truyền xuống requestFetch ở lần gọi thứ n. */
function optsOfCall(n = 0): FetchOptions & {
  onResponseError: (ctx: unknown) => void
  onRequestError: (ctx: unknown) => void
} {
  const call = mocks.requestFetch.mock.calls[n]
  if (!call) throw new Error(`requestFetch chưa được gọi lần thứ ${n}`)
  return call[1]
}

describe('useApi', () => {
  beforeEach(() => {
    mocks.requestFetch.mockReset()
    mocks.requestFetch.mockResolvedValue(null)
    mocks.runtimeConfig.public = {}
  })

  it('mặc định baseURL /api khi không cấu hình', async () => {
    await useApi()('/users')
    expect(mocks.requestFetch).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({ baseURL: '/api' }),
    )
  })

  it('lấy baseURL từ runtimeConfig.public.apiBaseURL', async () => {
    mocks.runtimeConfig.public.apiBaseURL = 'https://bff.antadmin'
    await useApi()('/x')
    expect(optsOfCall().baseURL).toBe('https://bff.antadmin')
  })

  it('options.baseURL ghi đè cấu hình runtime', async () => {
    mocks.runtimeConfig.public.apiBaseURL = 'https://bff.antadmin'
    await useApi({ baseURL: '/local' })('/x')
    expect(optsOfCall().baseURL).toBe('/local')
  })

  it('giữ nguyên options người gọi truyền vào', async () => {
    await useApi()('/x', { method: 'POST', body: { a: 1 } })
    expect(optsOfCall()).toMatchObject({ method: 'POST', body: { a: 1 } })
  })

  it('onResponseError chuẩn hoá lỗi HTTP về AppError (giữ status + message)', async () => {
    await useApi()('/x')
    let err: unknown
    try {
      optsOfCall().onResponseError({
        response: { status: 404, _data: { message: 'không thấy' } },
      })
    } catch (e) {
      err = e
    }
    expect(err).toMatchObject({ name: 'AppError', status: 404, message: 'không thấy' })
  })

  it('onRequestError chuẩn hoá lỗi mạng về AppError', async () => {
    await useApi()('/x')
    let err: unknown
    try {
      optsOfCall().onRequestError({ error: new Error('mạng lỗi') })
    } catch (e) {
      err = e
    }
    expect(err).toMatchObject({ name: 'AppError', message: 'mạng lỗi' })
  })
})
