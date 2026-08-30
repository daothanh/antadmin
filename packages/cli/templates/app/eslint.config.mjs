import { vue } from '@antadmin/eslint-config'

export default [
  ...vue,
  {
    ignores: ['.nuxt/**', '.output/**'],
  },
]
