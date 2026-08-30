import type { Meta, StoryObj } from '@storybook/vue3'
import { Button, FormItem, Input } from 'ant-design-vue'
import CForm from './CForm.vue'

const meta: Meta<typeof CForm> = {
  title: 'Components/CForm',
  component: CForm,
}
export default meta

type Story = StoryObj<typeof CForm>

export const Vertical: Story = {
  render: () => ({
    components: { CForm, AFormItem: FormItem, AInput: Input, AButton: Button },
    template: `
      <CForm style="max-width: 360px">
        <AFormItem label="Email">
          <AInput placeholder="you@antadmin.vn" />
        </AFormItem>
        <AFormItem label="Mật khẩu">
          <AInput type="password" placeholder="••••••••" />
        </AFormItem>
        <AFormItem>
          <AButton type="primary">Đăng nhập</AButton>
        </AFormItem>
      </CForm>
    `,
  }),
}
