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
// Type khai báo tường minh: để TS tự suy luận thì d.ts in lại nguyên cây type từng component, trong đó có
// `typeof import('vue').nextTick` mà api-extractor làm rơi `typeof` → d.ts publish lỗi (xem vite.config.ts).
export const components: {
  CAppLayout: typeof CAppLayout
  CButton: typeof CButton
  CCard: typeof CCard
  CChat: typeof CChat
  CChatMessage: typeof CChatMessage
  CEmpty: typeof CEmpty
  CFilterBar: typeof CFilterBar
  CForm: typeof CForm
  CSideNav: typeof CSideNav
  CInputCurrency: typeof CInputCurrency
  CInputPercent: typeof CInputPercent
  CPageHeader: typeof CPageHeader
  CStatistic: typeof CStatistic
  CStatus: typeof CStatus
  CTable: typeof CTable
  CTag: typeof CTag
  CTopNav: typeof CTopNav
} = {
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
