import { Modal } from 'ant-design-vue'

// Hộp thoại xác nhận dạng promise — thay cho việc tự gọi Modal.confirm rải rác.
// Đặt ở @antadmin/ui (không phải @antadmin/composables) vì phụ thuộc antd Modal.
export interface ConfirmOptions {
  title?: string
  content?: string
  okText?: string
  cancelText?: string
  /** Nút OK màu nguy hiểm (xoá/huỷ) — mặc định false. */
  danger?: boolean
}

/**
 * Trả về hàm `confirm(options) => Promise<boolean>`:
 * resolve `true` khi người dùng bấm Đồng ý, `false` khi Huỷ/đóng.
 *
 * @example
 * const confirm = useConfirm()
 * if (await confirm({ title: 'Xoá đơn hàng?', danger: true })) await remove(id)
 */
export function useConfirm() {
  return (options: ConfirmOptions = {}): Promise<boolean> =>
    new Promise((resolve) => {
      Modal.confirm({
        title: options.title ?? 'Xác nhận',
        content: options.content,
        okText: options.okText ?? 'Đồng ý',
        cancelText: options.cancelText ?? 'Huỷ',
        okType: options.danger ? 'danger' : 'primary',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
}
