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
  {
    name: 'antadmin/ui-test-stubs',
    // File test gom nhiều stub antdv (mỗi stub một defineComponent) trong factory vi.mock('ant-design-vue') để test
    // tự chứa, không kéo render antd thật. Quy tắc một component mỗi file dành cho component thật, không cho stub.
    files: ['**/*.test.ts'],
    rules: {
      'vue/one-component-per-file': 'off',
    },
  },
]