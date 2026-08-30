import type { Meta, StoryObj } from '@storybook/vue3'
import CStatistic from './CStatistic.vue'

const meta: Meta<typeof CStatistic> = {
  title: 'Components/CStatistic',
  component: CStatistic,
}
export default meta

type Story = StoryObj<typeof CStatistic>

export const Dashboard: Story = {
  render: () => ({
    components: { CStatistic },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
        <CStatistic label="Doanh thu" value="1.250.000.000" accent="primary" :trend="12.4">
          <template #icon>₫</template>
          <template #suffix>đ</template>
        </CStatistic>
        <CStatistic label="Đơn hàng" value="842" accent="accent" :trend="-3.1">
          <template #icon>📦</template>
        </CStatistic>
        <CStatistic label="Khách mới" value="128" accent="success" :trend="8">
          <template #icon>👤</template>
        </CStatistic>
      </div>
    `,
  }),
}
