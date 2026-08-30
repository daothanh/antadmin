import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import CAppLayout from './CAppLayout.vue'
import CSideNav from './CSideNav.vue'
import CTopNav from './CTopNav.vue'
import CButton from './CButton.vue'
import type { NavItem } from './CSideNav.vue'

const sideItems: NavItem[] = [
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

const topItems: NavItem[] = [
  { label: 'ĐIỀU HÀNH', path: '/' },
  { label: 'TỔ CHỨC', path: '/org' },
  { label: 'SẢN PHẨM', path: '/products' },
]

const meta: Meta<typeof CAppLayout> = {
  title: 'Layout/CAppLayout',
  component: CAppLayout,
  // Layout cao 100vh → cho khung cố định để xem trọn trong Storybook.
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="height:560px;margin:-16px"><story /></div>',
    }),
  ],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof CAppLayout>

export const FullShell: Story = {
  name: 'Khung ứng dụng đầy đủ',
  render: () => ({
    components: { CAppLayout, CSideNav, CTopNav, CButton },
    setup() {
      const collapsed = ref(false)
      const activePath = ref('/org/staff')
      return { collapsed, activePath, sideItems, topItems }
    },
    template: `
      <CAppLayout
        v-model:collapsed="collapsed"
        app-title="TASCO"
        footer-text="© 2026 AntAdmin — Framework FE nội bộ"
      >
        <template #header>
          <CTopNav :items="topItems" :active-path="activePath" @navigate="(p) => (activePath = p)" />
        </template>
        <template #actions>
          <CButton variant="text">🔔</CButton>
          <CButton variant="text">Tài khoản</CButton>
        </template>
        <template #nav>
          <CSideNav :items="sideItems" :active-path="activePath" :collapsed="collapsed" @navigate="(p) => (activePath = p)" />
        </template>

        <div style="background:var(--antadmin-color-surface);border:1px solid var(--antadmin-color-border);border-radius:8px;padding:16px">
          <h2 style="margin:0 0 8px">Nội dung trang</h2>
          <p style="color:var(--antadmin-color-text-muted);margin:0">
            activePath hiện tại: <strong>{{ activePath }}</strong> — bấm nút thu gọn ở góc trái để đổi <code>collapsed</code>.
          </p>
        </div>
      </CAppLayout>
    `,
  }),
}

export const Collapsed: Story = {
  name: 'Thu gọn sider',
  render: () => ({
    components: { CAppLayout, CSideNav, CTopNav },
    setup() {
      const collapsed = ref(true)
      const activePath = ref('/products')
      return { collapsed, activePath, sideItems, topItems }
    },
    template: `
      <CAppLayout v-model:collapsed="collapsed" app-title="TASCO">
        <template #header>
          <CTopNav :items="topItems" :active-path="activePath" @navigate="(p) => (activePath = p)" />
        </template>
        <template #nav>
          <CSideNav :items="sideItems" :active-path="activePath" :collapsed="collapsed" @navigate="(p) => (activePath = p)" />
        </template>
        <div style="padding:8px">Sider đang thu gọn.</div>
      </CAppLayout>
    `,
  }),
}
