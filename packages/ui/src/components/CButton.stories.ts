import type { Meta, StoryObj } from '@storybook/vue3'
import CButton from './CButton.vue'

const meta: Meta<typeof CButton> = {
  title: 'Components/CButton',
  component: CButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'link', 'text'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof CButton>

export const Playground: Story = {
  args: { variant: 'primary', size: 'md' },
  render: (args) => ({
    components: { CButton },
    setup: () => ({ args }),
    template: '<CButton v-bind="args">Nút AntAdmin</CButton>',
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { CButton },
    template: `
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <CButton variant="primary">Primary</CButton>
        <CButton variant="secondary">Secondary</CButton>
        <CButton variant="outline">Outline</CButton>
        <CButton variant="ghost">Ghost</CButton>
        <CButton variant="danger">Danger</CButton>
        <CButton variant="link">Link</CButton>
        <CButton variant="text">Text</CButton>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { CButton },
    template: `
      <div style="display:flex;gap:10px;align-items:center">
        <CButton size="sm">Small</CButton>
        <CButton size="md">Medium</CButton>
        <CButton size="lg">Large</CButton>
      </div>
    `,
  }),
}
