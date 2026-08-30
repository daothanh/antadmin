import { h } from 'vue'
import { IconHome, IconShoppingCart } from '@tabler/icons-vue'
import type { NavItem } from '@antadmin/ui'

// Cấu hình UI của ứng dụng — override mặc định từ @antadmin/nuxt-layer-base.
// Layout shell (logo + top menu + sider + footer) tự kế thừa; ở đây chỉ khai báo
// tiêu đề + menu. `topNav` = menu module ngang trên header; `nav` = sidebar.
// Icon là render function (vd @tabler/icons-vue) — giúp chế độ thu gọn đẹp hơn.
export default defineAppConfig({
  antadmin: {
    appTitle: '__APP_NAME__',
    footerText: '© Tập đoàn AntAdmin',
    topNav: [
      { label: 'Tổng quan', path: '/' },
    ] satisfies NavItem[],
    nav: [
      { label: 'Trang chủ', path: '/', icon: () => h(IconHome, { size: 18 }) },
      { label: 'Đơn hàng', path: '/orders', icon: () => h(IconShoppingCart, { size: 18 }) },
      // Ví dụ nhóm có menu con:
      // {
      //   label: 'Quản trị',
      //   icon: () => h(IconSettings, { size: 18 }),
      //   children: [{ label: 'Người dùng', path: '/admin/users' }],
      // },
    ] satisfies NavItem[],
  },
})
