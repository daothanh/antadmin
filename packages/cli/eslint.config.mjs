import { base, noDirectAntdv } from '@antadmin/eslint-config'

export default [
  ...base,
  noDirectAntdv,
  {
    // templates là mã nguồn mẫu (placeholder), không lint.
    ignores: ['templates/**'],
  },
]
