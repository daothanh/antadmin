import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import CTopNav from './CTopNav.vue'
import type { NavItem } from './CSideNav.vue'

const items: NavItem[] = [
  { label: 'ĐIỀU HÀNH', path: '/dieu-hanh' },
  { label: 'TỔ CHỨC', path: '/to-chuc' },
  {
    label: 'SẢN PHẨM',
    path: '/san-pham',
    children: [
      { label: 'Danh mục', path: '/san-pham/danh-muc' },
      { label: 'Kho', path: '/san-pham/kho' },
    ],
  },
  { label: 'BÁO CÁO', path: '/bao-cao' },
]

const meta: Meta<typeof CTopNav> = {
  title: 'Layout/CTopNav',
  component: CTopNav,
  argTypes: {
    activePath: { control: 'text' },
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="height:56px;display:flex;align-items:stretch;padding:0 16px;background:var(--antadmin-color-surface);border-bottom:1px solid var(--antadmin-color-border)"><story /></div>',
    }),
  ],
}
export default meta

type Story = StoryObj<typeof CTopNav>

export const Playground: Story = {
  args: { items, activePath: '/to-chuc' },
  render: (args) => ({
    components: { CTopNav },
    setup: () => ({ args }),
    template: '<CTopNav v-bind="args" @navigate="(p) => console.log(\'navigate\', p)" />',
  }),
}

export const Interactive: Story = {
  render: () => ({
    components: { CTopNav },
    setup() {
      const activePath = ref('/dieu-hanh')
      return { items, activePath }
    },
    template: '<CTopNav :items="items" :active-path="activePath" @navigate="(p) => (activePath = p)" />',
  }),
}
