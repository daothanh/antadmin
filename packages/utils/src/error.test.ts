import { describe, expect, it } from 'vitest'
import { AppError, isAppError, toAppError } from './error'

describe('toAppError', () => {
  it('trả về nguyên bản nếu đã là AppError', () => {
    const err = new AppError('x', { status: 400 })
    expect(toAppError(err)).toBe(err)
  })

  it('rút message từ _data.message của ofetch response error', () => {
    const input = { status: 422, _data: { message: 'Sai dữ liệu' }, statusText: 'Unprocessable' }
    const err = toAppError(input)
    expect(err).toBeInstanceOf(AppError)
    expect(err.status).toBe(422)
    expect(err.message).toBe('Sai dữ liệu')
    expect(err.data).toEqual({ message: 'Sai dữ liệu' })
  })

  it('rơi về statusText khi data không có message', () => {
    const err = toAppError({ status: 500, statusText: 'Server Error' })
    expect(err.message).toBe('Server Error')
    expect(err.status).toBe(500)
  })

  it('ưu tiên field error khi không có message', () => {
    const err = toAppError({ status: 400, _data: { error: 'boom' } })
    expect(err.message).toBe('boom')
  })

  it('bọc Error thường và giữ message', () => {
    const err = toAppError(new Error('kaboom'))
    expect(err.message).toBe('kaboom')
    expect(err.cause).toBeInstanceOf(Error)
  })

  it('bọc string', () => {
    expect(toAppError('lỗi chuỗi').message).toBe('lỗi chuỗi')
  })

  it('fallback cho giá trị lạ', () => {
    expect(toAppError(null).message).toBe('Đã xảy ra lỗi không xác định')
    expect(toAppError(undefined).message).toBe('Đã xảy ra lỗi không xác định')
  })
})

describe('isAppError', () => {
  it('phân biệt AppError với lỗi khác', () => {
    expect(isAppError(new AppError('x'))).toBe(true)
    expect(isAppError(new Error('x'))).toBe(false)
    expect(isAppError('x')).toBe(false)
  })
})
