import type { Meta, StoryObj } from '@storybook/vue3'
import CTag from './CTag.vue'

const meta: Meta<typeof CTag> = {
  title: 'Components/CTag',
  component: CTag,
}
export default meta

type Story = StoryObj<typeof CTag>

export const Colors: Story = {
  render: () => ({
    components: { CTag },
    template: `
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <CTag dot>Default</CTag>
        <CTag color="primary" dot>Primary</CTag>
        <CTag color="accent" dot>Accent</CTag>
        <CTag color="success" dot>Hoàn thành</CTag>
        <CTag color="warning" dot>Chờ duyệt</CTag>
        <CTag color="error" dot>Từ chối</CTag>
        <CTag color="info" dot>Đang xử lý</CTag>
      </div>
    `,
  }),
}
