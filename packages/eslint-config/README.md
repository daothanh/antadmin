# @antadmin/eslint-config

Flat config ESLint 10 dùng chung. Yêu cầu Node >= 20.19.

## Exports
- `base` — JS/TS recommended + type-imports + no-unused-vars (bỏ qua `_`).
- `vue` — `base` + `eslint-plugin-vue` (flat/recommended) + parser TS cho `.vue` + cấm import trực tiếp `ant-design-vue`.
- `noDirectAntdv` — chỉ riêng rule cấm `ant-design-vue` (để bật/tắt linh hoạt).
- `ignores` — bỏ qua `dist/.output/.nuxt/...`.

## Dùng trong package thường
```js
// eslint.config.mjs
import { vue } from '@antadmin/eslint-config'
export default [...vue]
```

## Dùng trong app Nuxt (kết hợp @nuxt/eslint)
```js
import withNuxt from './.nuxt/eslint.config.mjs'
import { vue } from '@antadmin/eslint-config'
export default withNuxt(...vue)
```
