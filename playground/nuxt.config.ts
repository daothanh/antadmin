export default defineNuxtConfig({
  extends: ['@antadmin/nuxt-layer-base'],
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  antd: {
    extractStyle: true,
  },
  // DEV: bật mock (bỏ qua IAM thật) để chạy end-to-end.
  runtimeConfig: {
    auth: {
      mock: true,
    },
  },
})
