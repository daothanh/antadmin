import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import { Dropdown, Menu, MenuItem } from 'ant-design-vue'
import { IconCircleCheck, IconCircleX, IconDotsVertical } from '@tabler/icons-vue'
import CTable from './CTable.vue'

const meta: Meta<typeof CTable> = {
  title: 'Components/CTable',
  component: CTable,
}
export default meta

type Story = StoryObj<typeof CTable>

export const Basic: Story = {
  render: () => ({
    components: { CTable },
    setup() {
      const columns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Tuổi', dataIndex: 'age', key: 'age' },
        { title: 'Phòng ban', dataIndex: 'dept', key: 'dept' },
      ]
      const dataSource = [
        { key: 1, name: 'An', age: 28, dept: 'Kỹ thuật' },
        { key: 2, name: 'Bình', age: 34, dept: 'Vận hành' },
        { key: 3, name: 'Cường', age: 41, dept: 'Tài chính' },
      ]
      return { columns, dataSource }
    },
    template: '<CTable :columns="columns" :data-source="dataSource" />',
  }),
}

// Dữ liệu demo cho trang danh sách — cột STT / trạng thái / ⋮ do TRANG tự dựng qua
// columns + #bodyCell (CTable không định nghĩa sẵn cột nào).
const MODELS = [
  { brand: 'GEELY', line: 'EX2', prefix: 'E22H', names: ['EX2 Pro', 'EX2 Max'] },
  { brand: 'GEELY', line: 'EX5', prefix: 'E245', names: ['EX5 Max'] },
  { brand: 'GEELY', line: 'EX5 EMI', prefix: 'P145', names: ['EX5 EMI Max', 'EX5 EMI Ultra'] },
  { brand: 'LYNK & CO', line: '02', prefix: 'LC02', names: ['Lynk & co 02 66Halo'] },
  { brand: 'LYNK & CO', line: '03', prefix: 'LC03', names: ['Lynk & co 03 Plus'] },
]
const EXTERIOR = ['Vàng', 'Xám', 'Đen', 'Trắng', 'Bạc', 'Đỏ', 'Xanh lá']
const INTERIOR = ['Xám', 'Trắng', 'Nâu', 'Đen', 'Xanh Đen', 'Hồng - Đen', 'Ghi - Đen']

const VEHICLES = Array.from({ length: 351 }, (_, i) => {
  const model = MODELS[i % MODELS.length]!
  return {
    id: i + 1,
    code: `${model.prefix}-${String((i % 40) + 1).padStart(2, '0')}`,
    name: `${model.names[i % model.names.length]} - Ngoại thất: ${EXTERIOR[i % EXTERIOR.length]} - Nội thất: ${INTERIOR[(i * 3) % INTERIOR.length]}`,
    brand: model.brand,
    line: model.line,
    status: i % 9 === 4 ? 0 : 1,
    updatedBy: i % 4 === 3 ? 'thangcd1' : 'thangcd',
    updatedAt: `${String((i % 28) + 1).padStart(2, '0')}/${String((i % 12) + 1).padStart(2, '0')}/2026`,
  }
})

export const ListPage: Story = {
  name: 'Trang danh sách',
  render: () => ({
    components: {
      CTable,
      ADropdown: Dropdown,
      AMenu: Menu,
      AMenuItem: MenuItem,
      IconCircleCheck,
      IconCircleX,
      IconDotsVertical,
    },
    setup() {
      const page = ref(1)
      const pageSize = ref(25)
      const keyword = ref('')
      const appliedKeyword = ref('')
      const filterCount = ref(1)
      const loading = ref(false)
      const lastEvent = ref('—')

      const rows = computed(() => {
        const q = appliedKeyword.value.trim().toLowerCase()
        return q
          ? VEHICLES.filter((v) => `${v.code} ${v.name}`.toLowerCase().includes(q))
          : VEHICLES
      })
      const pagination = computed(() => ({
        current: page.value,
        pageSize: pageSize.value,
        total: rows.value.length,
      }))

      const columns = [
        {
          title: 'STT',
          key: 'index',
          width: 72,
          align: 'center',
          customRender: ({ index }: { index: number }) => (page.value - 1) * pageSize.value + index + 1,
        },
        { title: 'Mã xe', dataIndex: 'code', key: 'code', width: 120 },
        { title: 'Tên xe', dataIndex: 'name', key: 'name', ellipsis: true },
        { title: 'Hãng xe', dataIndex: 'brand', key: 'brand', width: 130 },
        { title: 'Dòng xe', dataIndex: 'line', key: 'line', width: 110 },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 110, align: 'center' },
        { title: 'Người cập nhật', dataIndex: 'updatedBy', key: 'updatedBy', width: 150 },
        { title: 'Ngày cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', width: 140, align: 'center' },
        { title: '', key: 'actions', width: 56, align: 'center' },
      ]

      function onChange(p: { current?: number; pageSize?: number }) {
        page.value = p.current ?? 1
        pageSize.value = p.pageSize ?? pageSize.value
      }
      function onSearch(value: string) {
        appliedKeyword.value = value
        page.value = 1
        lastEvent.value = `search("${value}")`
      }
      function onReload() {
        loading.value = true
        lastEvent.value = 'reload'
        setTimeout(() => (loading.value = false), 800)
      }
      function log(event: string) {
        lastEvent.value = event
      }

      return { columns, rows, pagination, keyword, filterCount, loading, lastEvent, onChange, onSearch, onReload, log }
    },
    template: `
      <div>
        <CTable
          v-model:search-value="keyword"
          title="Danh sách phiên bản xe"
          row-key="id"
          :columns="columns"
          :data-source="rows"
          :pagination="pagination"
          :loading="loading"
          :scroll="{ x: 1200, y: 480 }"
          :filter-count="filterCount"
          show-create
          show-search
          show-filter
          show-export
          show-reload
          show-column-setting
          @change="onChange"
          @search="onSearch"
          @create="log('create')"
          @filter="filterCount = filterCount ? 0 : 1; log('filter')"
          @export="log('export')"
          @reload="onReload"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <IconCircleCheck v-if="record.status === 1" :size="20" style="color: var(--antadmin-color-success)" />
              <IconCircleX v-else :size="20" style="color: var(--antadmin-color-error)" />
            </template>
            <ADropdown v-else-if="column.key === 'actions'" :trigger="['click']" placement="bottomRight">
              <button
                type="button"
                aria-label="Thao tác"
                style="display:inline-flex;padding:2px;border:none;border-radius:999px;background:transparent;color:inherit;cursor:pointer"
              >
                <IconDotsVertical :size="20" />
              </button>
              <template #overlay>
                <AMenu @click="({ key }) => log(key + ' ' + record.code)">
                  <AMenuItem key="view">Xem chi tiết</AMenuItem>
                  <AMenuItem key="edit">Sửa</AMenuItem>
                  <AMenuItem key="delete" danger>Xoá</AMenuItem>
                </AMenu>
              </template>
            </ADropdown>
          </template>
        </CTable>
        <p style="margin:8px 0 0;color:var(--antadmin-color-text-muted)">Sự kiện gần nhất: {{ lastEvent }}</p>
      </div>
    `,
  }),
}

export const Collapsible: Story = {
  name: 'Thu gọn + toolbar tuỳ biến',
  render: () => ({
    components: { CTable },
    setup() {
      const columns = [
        { title: 'Mã đơn', dataIndex: 'code', key: 'code' },
        { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
        { title: 'Giá trị', dataIndex: 'amount', key: 'amount', align: 'right' },
      ]
      const dataSource = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        code: `DH-${String(i + 1).padStart(4, '0')}`,
        customer: ['Công ty An Bình', 'Tập đoàn Bắc Sơn'][i % 2],
        amount: `${((i + 1) * 1_250_000).toLocaleString('vi-VN')} ₫`,
      }))
      return { columns, dataSource }
    },
    template: `
      <CTable
        title="Đơn hàng gần đây"
        collapsible
        striped
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        show-reload
      >
        <template #toolbar>
          <span style="color:var(--antadmin-color-text-muted)">Slot #toolbar</span>
        </template>
      </CTable>
    `,
  }),
}
