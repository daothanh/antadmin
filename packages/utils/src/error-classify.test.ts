import { describe, expect, it } from 'vitest'
import { AppError } from './error'
import {
  errorSeverity,
  getFieldErrors,
  isAuthError,
  isForbidden,
  isNetworkError,
  isServerError,
  isValidation,
} from './error-classify'

const err = (status?: number, data?: unknown) => new AppError('x', { status, data })

describe('phân loại theo status', () => {
  it('isAuthError chỉ đúng với 401', () => {
    expect(isAuthError(err(401))).toBe(true)
    expect(isAuthError(err(403))).toBe(false)
  })
  it('isForbidden chỉ đúng với 403', () => {
    expect(isForbidden(err(403))).toBe(true)
    expect(isForbidden(err(401))).toBe(false)
  })
  it('isValidation chỉ đúng với 422', () => {
    expect(isValidation(err(422))).toBe(true)
    expect(isValidation(err(400))).toBe(false)
  })
  it('isServerError đúng với mọi 5xx', () => {
    expect(isServerError(err(500))).toBe(true)
    expect(isServerError(err(503))).toBe(true)
    expect(isServerError(err(499))).toBe(false)
  })
  it('isNetworkError đúng khi không có status', () => {
    expect(isNetworkError(err(undefined))).toBe(true)
    expect(isNetworkError(new Error('mất mạng'))).toBe(true)
    expect(isNetworkError(err(500))).toBe(false)
  })
})

describe('errorSeverity', () => {
  it('5xx/network → error', () => {
    expect(errorSeverity(err(500))).toBe('error')
    expect(errorSeverity(err(undefined))).toBe('error')
  })
  it('403/422 → warning', () => {
    expect(errorSeverity(err(403))).toBe('warning')
    expect(errorSeverity(err(422))).toBe('warning')
  })
  it('401 và khác → error', () => {
    expect(errorSeverity(err(401))).toBe('error')
    expect(errorSeverity(err(404))).toBe('error')
  })
})

describe('getFieldErrors', () => {
  it('trích từ data.errors (chuẩn hoá về string[])', () => {
    expect(getFieldErrors(err(422, { errors: { email: 'Sai định dạng', age: ['>0', '<150'] } }))).toEqual({
      email: ['Sai định dạng'],
      age: ['>0', '<150'],
    })
  })
  it('trích từ data.fields', () => {
    expect(getFieldErrors(err(422, { fields: { name: 'Bắt buộc' } }))).toEqual({ name: ['Bắt buộc'] })
  })
  it('không có → object rỗng', () => {
    expect(getFieldErrors(err(422))).toEqual({})
    expect(getFieldErrors(err(500, { message: 'x' }))).toEqual({})
  })
})
