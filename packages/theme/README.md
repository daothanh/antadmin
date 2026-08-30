# @antadmin/theme

Design token (single source of truth) cho thương hiệu AntAdmin, suy ra:
- **antdv theme** — đối tượng cho prop `theme` của `<a-config-provider>`
- **CSS variables** `--antadmin-*` cho style ngoài antdv

Package TS thuần, **không** phụ thuộc runtime vào ant-design-vue.

## API
```ts
import {
  lightTokens, darkTokens, tokensByMode,   // token gốc
  getAntdTheme, antdThemeLight, antdThemeDark, type ThemeMode, type AntdThemeConfig,
  cssVars, cssVarsText,
} from '@antadmin/theme'
```

## Dùng với ConfigProvider (sẽ đặt trong @antadmin/nuxt-layer-base)
```vue
<script setup lang="ts">
import { theme } from 'ant-design-vue'
import { getAntdTheme } from '@antadmin/theme'

const mode = 'light'
const antdTheme = {
  ...getAntdTheme(mode),
  algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
}
</script>

<template>
  <a-config-provider :theme="antdTheme"><slot /></a-config-provider>
</template>
```
> `algorithm` set ở layer (nơi có antdv) để theme package giữ độc lập.

## Inject CSS variables
```ts
import { cssVarsText } from '@antadmin/theme'
// trong nuxt.config app.head:
useHead({ style: [{ innerHTML: cssVarsText('light') }] })
```

## Tuỳ biến
Sửa `src/tokens.ts` — đổi 1 chỗ, lan toả cả antdv lẫn CSS vars. Thay placeholder màu bằng brand guideline thật.
