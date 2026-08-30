import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@antadmin/utils'

const mocks = vi.hoisted(() => ({
  msgError: vi.fn(),
  notifyError: vi.fn(),
}))

vi.mock('ant-design-vue', () => ({
  message: { error: mocks.msgError },
  notification: { error: mocks.notifyError },
}))

import { _resetErrorDedupe, useErrorHandler } from './useErrorHandler'

const err = (status: number | undefined, message = 'lỗi', data?: unknown) =>
  new AppError(message, { status, data })

describe('useErrorHandler', () => {
  beforeEach(() => {
    mocks.msgError.mockReset()
    mocks.notifyError.mockReset()
    _resetErrorDedupe()
  })

  it('lỗi thường (4xx) → message.error, không notification', () => {
    useErrorHandler().handleError(err(404, 'không thấy A'))
    expect(mocks.msgError).toHaveBeenCalledWith('không thấy A')
    expect(mocks.notifyError).not.toHaveBeenCalled()
  })

  it('5xx và network → notification.error', () => {
    const h = useErrorHandler()
    h.handleError(err(500, 'sập B'))
    h.handleError(err(undefined, 'mất mạng C'))
    expect(mocks.notifyError).toHaveBeenCalledTimes(2)
    expect(mocks.msgError).not.toHaveBeenCalled()
  })

  it('422 → không toast, trả AppError để form xử lý', () => {
    const out = useErrorHandler().handleError(err(422, 'validate D'))
    expect(mocks.msgError).not.toHaveBeenCalled()
    expect(mocks.notifyError).not.toHaveBeenCalled()
    expect(out).toBeInstanceOf(AppError)
    expect(out.status).toBe(422)
  })

  it('401 gọi onAuthError; 403 gọi onForbidden', () => {
    const onAuthError = vi.fn()
    const onForbidden = vi.fn()
    const h = useErrorHandler({ onAuthError, onForbidden })
    h.handleError(err(401, 'hết phiên E'))
    h.handleError(err(403, 'cấm F'))
    expect(onAuthError).toHaveBeenCalledTimes(1)
    expect(onForbidden).toHaveBeenCalledTimes(1)
  })

  it('silent → chỉ phân loại, không hiển thị', () => {
    const onAuthError = vi.fn()
    useErrorHandler({ onAuthError }).handleError(err(401, 'x G'), { silent: true })
    expect(onAuthError).toHaveBeenCalledTimes(1)
    expect(mocks.msgError).not.toHaveBeenCalled()
  })

  it('dedupe: toast trùng key trong cửa sổ chỉ hiện 1 lần', () => {
    const h = useErrorHandler()
    h.handleError(err(400, 'trùng H'))
    h.handleError(err(400, 'trùng H'))
    expect(mocks.msgError).toHaveBeenCalledTimes(1)
  })

  it('fallbackMessage khi lỗi không có message', () => {
    useErrorHandler().handleError(new AppError('', { status: 400 }), { fallbackMessage: 'Thất bại I' })
    expect(mocks.msgError).toHaveBeenCalledWith('Thất bại I')
  })
})
