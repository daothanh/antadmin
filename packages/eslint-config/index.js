// @antadmin/eslint-config — flat config dùng chung (ESLint 9).
//
// Export các mảng config để consumer "spread" vào eslint.config.mjs của họ:
//   import { base, vue, noDirectAntdv } from '@antadmin/eslint-config'
//   export default [...vue]
//
// Với app Nuxt, kết hợp cùng config do module @nuxt/eslint sinh ra:
//   import withNuxt from './.nuxt/eslint.config.mjs'
//   import { vue } from '@antadmin/eslint-config'
//   export default withNuxt(...vue)

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

/**
 * Cấm import trực tiếp `ant-design-vue` — bắt buộc đi qua @antadmin/ui.
 * (Bản thân @antadmin/ui sẽ tắt rule này tại chỗ.)
 */
export const noDirectAntdv = {
  name: 'antadmin/no-direct-antdv',
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'ant-design-vue',
            message: 'Không import trực tiếp ant-design-vue — hãy dùng @antadmin/ui.',
          },
        ],
        patterns: [
          {
            group: ['ant-design-vue/*'],
            message: 'Không import trực tiếp ant-design-vue — hãy dùng @antadmin/ui.',
          },
        ],
      },
    ],
  },
}

/** Bỏ qua các thư mục build phổ biến. */
export const ignores = {
  name: 'antadmin/ignores',
  ignores: [
    '**/dist/**',
    '**/.output/**',
    '**/.nuxt/**',
    '**/.turbo/**',
    '**/coverage/**',
    '**/storybook-static/**',
  ],
}

/** Config nền cho JS/TS. */
export const base = tseslint.config(
  ignores,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: 'antadmin/base',
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      // TypeScript đã kiểm tra biến không xác định; tắt để tránh false-positive
      // với ambient globals / Nuxt auto-imports.
      'no-undef': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)

/** Config cho dự án Vue / antdv (kế thừa base + rule cấm antdv trực tiếp). */
export const vue = [
  ...base,
  ...pluginVue.configs['flat/recommended'],
  {
    name: 'antadmin/vue-ts-parser',
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    rules: {
      // Nuxt pages/layouts thường 1 chữ (index, orders...) — chấp nhận.
      'vue/multi-word-component-names': 'off',
    },
  },
  noDirectAntdv,
]

export default base
