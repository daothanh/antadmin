// Mock backend cho demo — route cụ thể này override catch-all proxy của layer.
// Trong app thật, /api/** sẽ proxy sang apiProxyTarget.

interface Order {
  id: number
  code: string
  customer: string
  total: number
  status: string
}

const STATUSES = ['Mới', 'Đang xử lý', 'Hoàn tất', 'Huỷ']
const ALL_ORDERS: Order[] = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  code: `DH-${String(index + 1).padStart(4, '0')}`,
  customer: `Khách hàng ${index + 1}`,
  total: (index + 1) * 1_250_000,
  status: STATUSES[index % STATUSES.length] as string,
}))

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page ?? 1))
  const pageSize = Math.max(1, Number(query.pageSize ?? 5))
  const start = (page - 1) * pageSize

  return {
    items: ALL_ORDERS.slice(start, start + pageSize),
    total: ALL_ORDERS.length,
  }
})
