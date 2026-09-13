<script setup lang="ts">
// Trang showcase bộ UI/UX AntAdmin — public để xem nhanh không cần đăng nhập.
import type { TableFilterField } from '@antadmin/ui'

definePageMeta({ auth: false })

const amount = ref<number | null>(1250000)
const rate = ref<string>('8.5')

const cardTypes = ['default', 'primary', 'outline', 'filled', 'ghost'] as const

type OrderStatus = 'done' | 'pending' | 'rejected'

interface DemoOrder {
  id: number
  code: string
  customer: string
  status: OrderStatus
  createdAt: string
}

const STATUSES: OrderStatus[] = ['done', 'pending', 'rejected']
const CUSTOMERS = ['Công ty A', 'Công ty B', 'Công ty C', 'Công ty D']
const ORDERS: DemoOrder[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  code: `DH-${String(i + 1).padStart(3, '0')}`,
  customer: CUSTOMERS[i % CUSTOMERS.length] ?? '',
  status: STATUSES[i % STATUSES.length] ?? 'done',
  createdAt: `2026-09-${String((i % 13) + 1).padStart(2, '0')}`,
}))

const tagColor: Record<string, 'success' | 'warning' | 'error'> = {
  done: 'success',
  pending: 'warning',
  rejected: 'error',
}
const tagLabel: Record<string, string> = {
  done: 'Hoàn thành',
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
}

// Thiết lập bảng (thứ tự/ẩn cột, sắp xếp mặc định) nhớ theo khoá này — CTable và useTable dùng chung.
const ORDERS_TABLE_KEY = 'ui-kit:orders'

const columns = [
  { title: 'Mã', dataIndex: 'code', key: 'code', sorter: true },
  { title: 'Khách hàng', dataIndex: 'customer', key: 'customer', sorter: true },
  { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', sorter: true },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
]
const filterFields: TableFilterField[] = [
  { key: 'customer', label: 'Khách hàng', type: 'input', placeholder: 'Tên khách hàng' },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'select',
    multiple: true,
    options: STATUSES.map((status) => ({ label: tagLabel[status] ?? status, value: status })),
  },
  { key: 'createdAt', label: 'Ngày tạo', type: 'dateRange' },
]

interface OrdersQuery {
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: 'ascend' | 'descend'
  filters?: Record<string, unknown>
}

// Fetcher demo lọc + sắp xếp tại chỗ (chạy offline); trang thật gọi useApi, backend nhận query.filters/sortField.
async function fetchOrders(query: OrdersQuery) {
  const { customer, status, createdAt } = query.filters ?? {}
  const items = ORDERS.filter((order) => {
    if (typeof customer === 'string' && !order.customer.toLowerCase().includes(customer.toLowerCase())) {
      return false
    }
    if (Array.isArray(status) && !status.includes(order.status)) return false
    if (Array.isArray(createdAt)) {
      const [from, to]: unknown[] = createdAt
      if (typeof from === 'string' && order.createdAt < from) return false
      if (typeof to === 'string' && order.createdAt > to) return false
    }
    return true
  })
  const { sortField, sortOrder } = query
  if (sortField === 'code' || sortField === 'customer' || sortField === 'createdAt') {
    const direction = sortOrder === 'descend' ? -1 : 1
    items.sort((a, b) => a[sortField].localeCompare(b[sortField], 'vi') * direction)
  }
  const start = (query.page - 1) * query.pageSize
  return { items: items.slice(start, start + query.pageSize), total: items.length }
}

const { dataSource, loading, pagination, filterValues, onChange, onFilter } = useTable(fetchOrders, {
  pageSize: 5,
  filters: { status: ['pending'] },
  settingsKey: ORDERS_TABLE_KEY,
})
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:8px">
    <CPageHeader
      title="Bộ UI/UX AntAdmin"
      sub-title="Design system"
      :breadcrumb="[{ title: 'Trang chủ', to: '/' }, { title: 'UI Kit' }]"
      @navigate="navigateTo($event)"
    >
      <template #extra>
        <CButton
          variant="outline"
          size="sm"
        >
          Tài liệu
        </CButton>
        <CButton
          variant="primary"
          size="sm"
        >
          Bắt đầu
        </CButton>
      </template>
    </CPageHeader>

    <!-- KPI -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px">
      <CStatistic
        label="Doanh thu"
        value="1.25 tỷ"
        accent="primary"
        :trend="12.4"
      >
        <template #icon>
          ₫
        </template>
      </CStatistic>
      <CStatistic
        label="Đơn hàng"
        value="842"
        accent="accent"
        :trend="-3.1"
      >
        <template #icon>
          📦
        </template>
      </CStatistic>
      <CStatistic
        label="Khách mới"
        value="128"
        accent="success"
        :trend="8"
      >
        <template #icon>
          👤
        </template>
      </CStatistic>
    </div>

    <!-- Buttons -->
    <CCard title="Nút bấm (CButton)">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <CButton variant="primary">
          Primary
        </CButton>
        <CButton variant="secondary">
          Secondary
        </CButton>
        <CButton variant="outline">
          Outline
        </CButton>
        <CButton variant="ghost">
          Ghost
        </CButton>
        <CButton variant="danger">
          Danger
        </CButton>
        <CButton variant="link">
          Link
        </CButton>
        <CButton variant="text">
          Text
        </CButton>
      </div>
    </CCard>

    <!-- Tags + Status -->
    <CCard
      title="Nhãn & trạng thái"
      type="primary"
    >
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <CTag
          color="primary"
          dot
        >
          Primary
        </CTag>
        <CTag
          color="success"
          dot
        >
          Hoàn thành
        </CTag>
        <CTag
          color="warning"
          dot
        >
          Chờ duyệt
        </CTag>
        <CTag
          color="error"
          dot
        >
          Từ chối
        </CTag>
        <CTag
          color="info"
          dot
        >
          Đang xử lý
        </CTag>
        <span style="width:16px" />
        <CStatus
          :status="1"
          show-text
        />
        <CStatus
          :status="0"
          show-text
        />
      </div>
    </CCard>

    <!-- Card types -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px">
      <CCard
        v-for="t in cardTypes"
        :key="t"
        :type="t"
        :title="`Card ${t}`"
        :borderless="false"
      >
        Nội dung card kiểu <strong>{{ t }}</strong>.
      </CCard>
    </div>

    <!-- Inputs -->
    <CCard
      title="Nhập liệu"
      collapsible
      type="primary"
    >
      <CForm style="max-width:360px">
        <a-form-item label="Số tiền">
          <CInputCurrency v-model:value="amount" />
        </a-form-item>
        <a-form-item label="Tỷ lệ (%)">
          <CInputPercent v-model:value="rate" />
        </a-form-item>
      </CForm>
    </CCard>

    <!-- Table: khung trang danh sách (tiêu đề + toolbar + phân trang chuẩn + bộ lọc drawer qua useTable) -->
    <CTable
      title="Bảng dữ liệu (CTable)"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :filter-fields="filterFields"
      :filter-values="filterValues"
      :settings-key="ORDERS_TABLE_KEY"
      row-key="id"
      show-create
      show-search
      show-filter
      show-export
      show-reload
      show-column-setting
      @change="onChange"
      @update:filter-values="onFilter"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <CTag
            :color="tagColor[record.status]"
            dot
          >
            {{ tagLabel[record.status] }}
          </CTag>
        </template>
      </template>
    </CTable>

    <!-- Empty -->
    <CCard title="Trạng thái rỗng (CEmpty)">
      <CEmpty
        description="Chưa có dữ liệu"
        bordered
      >
        <CButton
          variant="primary"
          size="sm"
        >
          Tạo mới
        </CButton>
      </CEmpty>
    </CCard>
  </div>
</template>
