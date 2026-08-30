import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { FormItem } from 'ant-design-vue'
import CInputCurrency from './CInputCurrency.vue'
import CInputPercent from './CInputPercent.vue'

const meta: Meta = {
  title: 'Components/Inputs',
}
export default meta

type Story = StoryObj

export const CurrencyAndPercent: Story = {
  render: () => ({
    components: { CInputCurrency, CInputPercent, AFormItem: FormItem },
    setup() {
      const amount = ref<number | null>(1250000)
      const rate = ref<string>('8.5')
      return { amount, rate }
    },
    template: `
      <div style="max-width:320px;display:flex;flex-direction:column;gap:12px">
        <AFormItem label="Số tiền">
          <CInputCurrency v-model:value="amount" />
        </AFormItem>
        <AFormItem label="Tỷ lệ (%)">
          <CInputPercent v-model:value="rate" />
        </AFormItem>
        <div style="font-size:13px;color:var(--antadmin-color-text-muted)">
          amount = {{ amount }} · rate = {{ rate }}
        </div>
      </div>
    `,
  }),
}
