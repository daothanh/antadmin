import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ confirm: vi.fn() }))

vi.mock('ant-design-vue', () => ({
  Modal: { confirm: mocks.confirm },
}))

import { useConfirm } from './useConfirm'

interface ConfirmArg {
  title?: string
  okText?: string
  cancelText?: string
  okType?: string
  onOk: () => void
  onCancel: () => void
}

/** Options mà useConfirm đã truyền vào Modal.confirm ở lần gọi gần nhất. */
function lastConfirmArg(): ConfirmArg {
  const calls = mocks.confirm.mock.calls
  return calls[calls.length - 1]?.[0] as ConfirmArg
}

describe('useConfirm', () => {
  beforeEach(() => mocks.confirm.mockReset())

  it('resolve true khi bấm Đồng ý (onOk)', async () => {
    const p = useConfirm()({ title: 'Xoá?' })
    lastConfirmArg().onOk()
    expect(await p).toBe(true)
  })

  it('resolve false khi Huỷ (onCancel)', async () => {
    const p = useConfirm()({ title: 'Xoá?' })
    lastConfirmArg().onCancel()
    expect(await p).toBe(false)
  })

  it('áp mặc định title/okText/cancelText và okType primary', () => {
    useConfirm()()
    expect(lastConfirmArg()).toMatchObject({
      title: 'Xác nhận',
      okText: 'Đồng ý',
      cancelText: 'Huỷ',
      okType: 'primary',
    })
  })

  it('danger=true → okType danger, giữ text tuỳ biến', () => {
    useConfirm()({ title: 'Xoá đơn', okText: 'Xoá', danger: true })
    expect(lastConfirmArg()).toMatchObject({ title: 'Xoá đơn', okText: 'Xoá', okType: 'danger' })
  })
})
