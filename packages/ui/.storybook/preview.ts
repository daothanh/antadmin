import type { Component } from 'vue'
import { ConfigProvider, theme } from 'ant-design-vue'
import viVN from 'ant-design-vue/es/locale/vi_VN'
import { getAntdTheme, cssVarsText } from '@antadmin/theme'
import '@antadmin/theme/base.css'

// Inject biến --antadmin-* vào <head> để scoped style của component (bám var) hiển
// thị đúng trong Storybook — giống cách layer app.vue làm runtime.
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = cssVarsText('light')
  document.head.appendChild(style)
}

// Bọc mọi story trong ConfigProvider áp theme + locale vi_VN (giống cách layer làm).
export const decorators = [
  (story: Component) => ({
    components: { AConfigProvider: ConfigProvider, story },
    setup() {
      const antdTheme = { ...getAntdTheme('light'), algorithm: theme.defaultAlgorithm }
      return { antdTheme, viVN }
    },
    template:
      '<AConfigProvider :theme="antdTheme" :locale="viVN"><div style="padding:16px;background:var(--antadmin-color-page)"><story /></div></AConfigProvider>',
  }),
]

export const parameters = {
  controls: { expanded: true },
}
