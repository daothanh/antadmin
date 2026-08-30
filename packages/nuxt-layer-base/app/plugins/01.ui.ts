import { AntAdminUI } from '@antadmin/ui'

// Đăng ký global components C* (CButton/CTable/CForm...).
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(AntAdminUI)
})
