import type { NavItem } from '@antadmin/ui'

// Cấu hình UI mặc định của framework. Team sản phẩm override bằng app.config.ts
// của họ (Nuxt merge sâu; mảng `nav` bị thay nguyên bởi layer gần hơn).
export default defineAppConfig({
  antadmin: {
    // Chế độ theme mặc định.
    themeMode: 'light' as 'light' | 'dark',
    // Tiêu đề + chân trang hiển thị ở layout shell.
    appTitle: 'AntAdmin',
    footerText: '© AntAdmin',
    // Menu module ngang trên header (vd ĐIỀU HÀNH, TỔ CHỨC...). Rỗng → ẩn.
    topNav: [] as NavItem[],
    // Menu điều hướng sidebar. Mặc định rỗng — dự án tự khai báo.
    nav: [] as NavItem[],
  },
})
