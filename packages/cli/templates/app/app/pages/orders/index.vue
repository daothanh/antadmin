<script setup lang="ts">
// Trang DANH SÁCH mẫu — minh hoạ pattern chuẩn của framework:
//   CPageHeader + useTable + CTable + gating quyền (usePermission) + CStatus/CTag.
// Mọi composable (useTable, usePermission…) và component C* đều auto-import từ layer.
definePageMeta({ auth: true })

interface Order {
  id: number
  code: string
  customer: string
  amount: number
  status: number
}

// ── Dữ liệu DEMO (chạy offline ngay sau khi scaffold). ───────────────────────
// Khi nối backend thật, thay fetcher bằng useApi (BFF proxy /api/**):
//   const api = useApi()
//   const fetchOrders = (q) => api<{ items: Order[]; total: number }>('/orders', {
//     query: { page: q.page, pageSize: q.pageSize, sort: q.sortField, order: q.sortOrder },
//   })
const ALL: Order[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  code: `DH-${String(i + 1).padStart(4, '0')}`,
  customer: ['Công ty An Bình', 'Tập đoàn Bắc Sơn', 'Cửa hàng Cường Thịnh'][i % 3] ?? '',
  amount: (i + 1) * 1_250_000,
  status: i % 4 === 0 ? 0 : 1,
}))

async function fetchOrders(q: { page: number; pageSize: number }) {
  await new Promise((r) => setTimeout(r, 200)) // giả lập độ trễ mạng
  const start = (q.page - 1) * q.pageSize
  return { items: ALL.slice(start, start + q.pageSize), total: ALL.length }
}

const { dataSource, pagination, loading, onChange, reload } = useTable(fetchOrders, {
  pageSize: 10,
})

// Gating theo quyền (URI). Nút chỉ hiện khi user có quyền tương ứng.
const { can } = usePermission()

const columns = [
  { title: 'Mã đơn', dataIndex: 'code', key: 'code', width: 140 },
  { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
  { title: 'Giá trị', dataIndex: 'amount', key: 'amount', align: 'right', width: 180 },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 160 },
]

const currency = new Intl.NumberFormat('vi-VN')
</script>

<template>
  <div>
    <CPageHeader title="Đơn hàng" sub-title="Danh sách mẫu (useTable + CTable)">
      <template #extra>
        <CButton variant="outline" @click="reload">Tải lại</CButton>
        <CButton v-if="can('/orders/create')" variant="primary">Tạo mới</CButton>
      </template>
    </CPageHeader>

    <CTable
      row-key="id"
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      @change="onChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'code'">
          <CTag color="primary">{{ (record as any).code }}</CTag>
        </template>
        <template v-else-if="column.key === 'amount'">
          {{ currency.format((record as any).amount) }} ₫
        </template>
        <template v-else-if="column.key === 'status'">
          <CStatus :status="(record as any).status" show-text />
        </template>
      </template>
    </CTable>
  </div>
</template>
