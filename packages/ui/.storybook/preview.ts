import type { Component } from 'vue'
import { ConfigProvider, theme } from 'ant-design-vue'
import { getAntdTheme, cssVarsText } from '@antadmin/theme'
import '@antadmin/theme/base.css'

// Inject biến --antadmin-* vào <head> để scoped style của component (bám var) hiển
// thị đúng trong Storybook — giống cách layer app.vue làm runtime.
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = cssVarsText('light')
  document.head.appendChild(style)
}

// Bọc mọi story trong ConfigProvider áp theme AntAdmin (giống cách layer làm).
export const decorators = [
  (story: Component) => ({
    components: { AConfigProvider: ConfigProvider, story },
    setup() {
      const antdTheme = { ...getAntdTheme('light'), algorithm: theme.defaultAlgorithm }
      return { antdTheme }
    },
    template:
      '<AConfigProvider :theme="antdTheme"><div style="padding:16px;background:var(--antadmin-color-page)"><story /></div></AConfigProvider>',
  }),
]

export const parameters = {
  controls: { expanded: true },
}
