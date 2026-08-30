import type { Meta, StoryObj } from '@storybook/vue3'
import CChatMessage from './CChatMessage.vue'

const meta: Meta<typeof CChatMessage> = {
  title: 'Components/CChatMessage',
  component: CChatMessage,
}
export default meta

type Story = StoryObj<typeof CChatMessage>

export const Roles: Story = {
  render: () => ({
    components: { CChatMessage },
    template: `
      <div style="display:flex;flex-direction:column;gap:10px;max-width:480px">
        <CChatMessage role="user" content="Doanh thu quý 3 tăng bao nhiêu %?" />
        <CChatMessage role="assistant" content="Quý 3 tăng 12,4% so với quý 2, chủ yếu nhờ mảng ETC." />
        <CChatMessage role="assistant" content="" :pending="true" />
        <CChatMessage role="system" content="Bối cảnh: dữ liệu nội bộ AntAdmin." />
      </div>
    `,
  }),
}
