import { vue } from '@antadmin/eslint-config'

export default [
  ...vue,
  {
    name: 'antadmin/layer-allow-antdv',
    // Layer là core, được phép import ant-design-vue (ConfigProvider, theme algorithm).
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    ignores: ['.nuxt/**', '.output/**'],
  },
]
