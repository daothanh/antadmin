import { base } from '@antadmin/eslint-config'

export default [
  ...base,
  {
    // Script build + launcher được phép dùng console.
    files: ['scripts/**', 'bin/**'],
    rules: { 'no-console': 'off' },
  },
]
