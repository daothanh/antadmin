import type { App, Plugin } from 'vue'
import CAppLayout from './components/CAppLayout.vue'
import CButton from './components/CButton.vue'
import CCard from './components/CCard.vue'
import CChat from './components/CChat.vue'
import CChatMessage from './components/CChatMessage.vue'
import CEmpty from './components/CEmpty.vue'
import CFilterBar from './components/CFilterBar.vue'
import CSideNav from './components/CSideNav.vue'
import CForm from './components/CForm.vue'
import CInputCurrency from './components/CInputCurrency.vue'
import CInputPercent from './components/CInputPercent.vue'
import CPageHeader from './components/CPageHeader.vue'
import CStatistic from './components/CStatistic.vue'
import CStatus from './components/CStatus.vue'
import CTable from './components/CTable.vue'
import CTag from './components/CTag.vue'
import CTopNav from './components/CTopNav.vue'

// Map các component "thương hiệu AntAdmin" (có style riêng) để đăng ký global.
// Primitive antdv re-export ở index.ts không đăng ký global (đã có a-* từ
// @ant-design-vue/nuxt) — tránh trùng và giữ bundle gọn.
export const components = {
  CAppLayout,
  CButton,
  CCard,
  CChat,
  CChatMessage,
  CEmpty,
  CFilterBar,
  CForm,
  CSideNav,
  CInputCurrency,
  CInputPercent,
  CPageHeader,
  CStatistic,
  CStatus,
  CTable,
  CTag,
  CTopNav,
}

// Plugin để đăng ký global components (layer gọi app.use(AntAdminUI)).
export const AntAdminUI: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  },
}

export default AntAdminUI
