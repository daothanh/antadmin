import type { Meta, StoryObj } from '@storybook/vue3'
import CCard from './CCard.vue'
import CButton from './CButton.vue'

const meta: Meta<typeof CCard> = {
  title: 'Components/CCard',
  component: CCard,
}
export default meta

type Story = StoryObj<typeof CCard>

export const Basic: Story = {
  render: () => ({
    components: { CCard, CButton },
    template: `
      <CCard title="Thông tin đơn hàng" style="max-width:520px">
        <template #actions><CButton variant="outline" size="sm">Sửa</CButton></template>
        <p>Nội dung thẻ — mô tả chi tiết đơn hàng, khách hàng, sản phẩm...</p>
      </CCard>
    `,
  }),
}

export const Collapsible: Story = {
  render: () => ({
    components: { CCard },
    template: `
      <CCard title="Bộ lọc nâng cao" collapsible style="max-width:520px">
        <p>Khu vực chứa các trường lọc, có thể thu gọn để tiết kiệm không gian.</p>
      </CCard>
    `,
  }),
}
