import { vue } from '@antadmin/eslint-config'

export default [
  ...vue,
  {
    name: 'antadmin/ui-allow-antdv',
    // @antadmin/ui là nơi DUY NHẤT được phép import trực tiếp ant-design-vue.
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
