import type {
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
} from '@antadmin/ui'

declare module 'vue-router' {
  interface RouteMeta {
    /** Đặt false để route không yêu cầu đăng nhập. Mặc định true. */
    auth?: boolean
    /** Danh sách permission cần có để vào route. */
    permissions?: string[]
  }
}

declare module 'vue' {
  interface GlobalComponents {
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
  }
}

export {}
