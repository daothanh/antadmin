<script setup lang="ts">
// Trang được bảo vệ + yêu cầu quyền order.read (user mock có quyền này).
definePageMeta({ permissions: ['order.read'] })

interface Order {
  id: number
  code: string
  customer: string
  total: number
  status: string
}

const api = useApi()
const { dataSource, loading, pagination, onChange, load } = useTable<Order>(
  (query) => api('/orders', { query }),
  { pageSize: 5, immediate: false },
)

const columns = [
  { title: 'Mã', dataIndex: 'code', key: 'code' },
  { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
  { title: 'Tổng (đ)', dataIndex: 'total', key: 'total' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
]

// Top-level await → SSR chờ dữ liệu (qua BFF /api/orders + forward cookie).
await load()
</script>

<template>
  <div>
    <h1>Đơn hàng</h1>
    <CTable
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @change="onChange"
    />
  </div>
</template>
