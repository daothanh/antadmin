import type { StorybookConfig } from '@storybook/vue3-vite'

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
  // Base tương đối để bản build tĩnh chạy được dưới subpath (vd Cloudflare Pages
  // phục vụ Storybook ở /storybook/) mà không phụ thuộc đường dẫn tuyệt đối.
  viteFinal(viteConfig) {
    viteConfig.base = './'
    return viteConfig
  },
}

export default config
