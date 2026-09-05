import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AntAdmin Framework',
  description: 'Framework FE nội bộ (Nuxt 4 + Ant Design Vue)',
  lang: 'vi-VN',
  // GitHub Pages phục vụ docs ở https://daothanh.github.io/antadmin/.
  base: '/antadmin/',
  themeConfig: {
    nav: [
      { text: 'Hướng dẫn', link: '/guide/getting-started' },
      { text: 'Đóng góp', link: '/contributing/rfc' },
      { text: 'Storybook', link: 'https://daothanh.github.io/antadmin/storybook/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Bắt đầu',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Kiến trúc', link: '/guide/architecture' },
            { text: 'CI/CD & Deploy', link: '/guide/deploy' },
          ],
        },
        {
          text: 'Packages',
          items: [
            { text: 'UI — @antadmin/ui', link: '/guide/ui' },
            { text: 'Composables', link: '/guide/composables' },
            { text: 'Theme', link: '/guide/theming' },
            { text: 'Auth & Permission', link: '/guide/auth' },
          ],
        },
        {
          text: 'AI',
          items: [
            { text: 'AI trong sản phẩm — @antadmin/ai', link: '/guide/ai' },
            { text: 'AI tooling cho dev', link: '/guide/ai-tooling' },
          ],
        },
        {
          text: 'Nâng cấp',
          items: [{ text: 'Migration Guide', link: '/guide/migration' }],
        },
      ],
      '/contributing/': [
        {
          text: 'Đóng góp',
          items: [
            { text: 'Triển khai Git', link: '/contributing/git-workflow' },
            { text: 'Cấu hình .npmrc', link: '/contributing/npmrc' },
            { text: 'Bootstrap npmjs', link: '/contributing/npm-bootstrap' },
            { text: 'RFC Process', link: '/contributing/rfc' },
            { text: 'Release', link: '/contributing/releasing' },
          ],
        },
      ],
    },
    outline: { label: 'Mục lục', level: [2, 3] },
  },
})
