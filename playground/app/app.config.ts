import { h } from 'vue'
import { IconHome, IconShoppingCart, IconSettings } from '@tabler/icons-vue'
import type { NavItem } from '@antadmin/ui'

// Cấu hình UI của playground — minh hoạ layout chung "giống OneAuto":
// menu module ngang (topNav) + sidebar có icon + item active pill cam.
export default defineAppConfig({
  antadmin: {
    appTitle: 'AntAdmin Playground',
    footerText: '© AntAdmin — Playground',
    topNav: [
      { label: 'Tổng quan', path: '/' },
      { label: 'Bán hàng', path: '/orders' },
      { label: 'Hệ thống', path: '/admin' },
    ] satisfies NavItem[],
    nav: [
      { label: 'Trang chủ', path: '/', icon: () => h(IconHome, { size: 18 }) },
      {
        label: 'Bán hàng',
        icon: () => h(IconShoppingCart, { size: 18 }),
        children: [{ label: 'Đơn hàng', path: '/orders' }],
      },
      {
        label: 'Hệ thống',
        icon: () => h(IconSettings, { size: 18 }),
        children: [
          { label: 'Quản trị', path: '/admin' },
          { label: 'UI Kit', path: '/ui-kit' },
        ],
      },
    ] satisfies NavItem[],
  },
})
