import type { StorybookConfig } from '@storybook/vue3-vite'
import type { PluginOption } from 'vite'

// Plugin sinh d.ts của build lib kế thừa từ vite.config.ts — Storybook không cần type. Storybook bỏ `build.lib` nên
// plugin lấy entry theo `types` trong package.json: chạy api-extractor lại trên dist/index.d.ts rồi ghi đè file đó,
// còn đổ .d.ts (cả test) vào storybook-static.
function isDtsPlugin(plugin: PluginOption): boolean {
  return typeof plugin === 'object' && plugin !== null && 'name' in plugin && plugin.name === 'vite:dts'
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  // Kiểm tra a11y (axe-core) ngay trong panel Accessibility của mỗi story.
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  // Base tương đối để bản build tĩnh chạy được dưới subpath (vd GitHub Pages
  // phục vụ Storybook ở /antadmin/storybook/) mà không phụ thuộc đường dẫn tuyệt đối.
  viteFinal(viteConfig) {
    viteConfig.base = './'
    viteConfig.plugins = viteConfig.plugins?.filter((plugin) => !isDtsPlugin(plugin))
    return viteConfig
  },
}

export default config
