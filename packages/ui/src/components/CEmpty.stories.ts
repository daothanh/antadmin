import type { Meta, StoryObj } from '@storybook/vue3'
import CEmpty from './CEmpty.vue'
import CButton from './CButton.vue'

const meta: Meta<typeof CEmpty> = {
  title: 'Components/CEmpty',
  component: CEmpty,
}
export default meta

type Story = StoryObj<typeof CEmpty>

export const Default: Story = {
  render: () => ({
    components: { CEmpty, CButton },
    template: `
      <CEmpty description="Chưa có đơn hàng nào" bordered>
        <CButton variant="primary" size="sm">Tạo đơn đầu tiên</CButton>
      </CEmpty>
    `,
  }),
}
