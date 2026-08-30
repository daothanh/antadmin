import type { Meta, StoryObj } from '@storybook/vue3'
import CPageHeader from './CPageHeader.vue'
import CButton from './CButton.vue'

const meta: Meta<typeof CPageHeader> = {
  title: 'Components/CPageHeader',
  component: CPageHeader,
}
export default meta

type Story = StoryObj<typeof CPageHeader>

export const WithBreadcrumb: Story = {
  render: () => ({
    components: { CPageHeader, CButton },
    template: `
      <CPageHeader
        title="Danh sách đơn hàng"
        sub-title="Quản lý bán hàng"
        :breadcrumb="[{ title: 'Trang chủ', to: '/' }, { title: 'Bán hàng', to: '/sales' }, { title: 'Đơn hàng' }]"
      >
        <template #extra>
          <CButton variant="outline" size="sm">Xuất Excel</CButton>
          <CButton variant="primary" size="sm">Tạo đơn</CButton>
        </template>
      </CPageHeader>
    `,
  }),
}
