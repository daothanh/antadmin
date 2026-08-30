import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import CSideNav from './CSideNav.vue'
import type { NavItem } from './CSideNav.vue'

const items: NavItem[] = [
  { label: 'Tổng quan', path: '/' },
  {
    label: 'Tổ chức',
    path: '/org',
    children: [
      { label: 'Nhân sự', path: '/org/staff' },
      { label: 'Phòng ban', path: '/org/departments' },
    ],
  },
  { label: 'Sản phẩm', path: '/products' },
  { label: 'Báo cáo', path: '/reports' },
]

const meta: Meta<typeof CSideNav> = {
  title: 'Layout/CSideNav',
  component: CSideNav,
  argTypes: {
    activePath: { control: 'text' },
    collapsed: { control: 'boolean' },
  },
  // Sider có nền trong suốt → đặt trên nền gradient navy để thấy rõ.
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="width:248px;height:420px;background:linear-gradient(to bottom,var(--antadmin-color-sidebar-top),var(--antadmin-color-sidebar-bottom))"><story /></div>',
    }),
  ],
}
export default meta

type Story = StoryObj<typeof CSideNav>

export const Playground: Story = {
  args: { items, activePath: '/org/staff', collapsed: false },
  render: (args) => ({
    components: { CSideNav },
    setup: () => ({ args }),
    template: '<CSideNav v-bind="args" @navigate="(p) => console.log(\'navigate\', p)" />',
  }),
}

export const ActiveTheoTienTo: Story = {
  name: 'Active theo tiền tố dài nhất',
  render: () => ({
    components: { CSideNav },
    setup() {
      const activePath = ref('/products/123/detail')
      return { items, activePath }
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:8px">
        <CSideNav :items="items" :active-path="activePath" @navigate="(p) => (activePath = p)" />
        <div style="color:#fff;font-size:12px;padding:0 12px">activePath = {{ activePath }}</div>
      </div>
    `,
  }),
}
