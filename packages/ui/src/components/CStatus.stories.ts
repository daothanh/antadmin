import type { Meta, StoryObj } from '@storybook/vue3'
import CStatus from './CStatus.vue'

const meta: Meta<typeof CStatus> = {
  title: 'Components/CStatus',
  component: CStatus,
}
export default meta

type Story = StoryObj<typeof CStatus>

export const States: Story = {
  render: () => ({
    components: { CStatus },
    template: `
      <div style="display:flex;gap:24px;align-items:center">
        <CStatus :status="1" show-text />
        <CStatus :status="0" show-text />
        <CStatus :status="true" />
        <CStatus :status="false" />
      </div>
    `,
  }),
}
