# @antadmin/ui

Wrapper Ant Design Vue chuẩn hoá — **entry point design system** cho team sản phẩm.
Team **không** import `ant-design-vue` trực tiếp (ESLint chặn); dùng qua package này để
core kiểm soát version, default props và token.

## Cài đặt (qua layer)
Layer `@antadmin/nuxt-layer-base` sẽ `app.use(AntAdminUI)` và áp theme. App thường:
```ts
import { AntAdminUI } from '@antadmin/ui'
app.use(AntAdminUI)
```

## Component
| Wrapper | antdv gốc | Default |
|---|---|---|
| `CButton` | `a-button` | — |
| `CTable` | `a-table` | `size="middle"` |
| `CForm` | `a-form` | `layout="vertical"` |

Mọi attrs/slots được forward nguyên vẹn xuống component antdv.

## Re-export có kiểm soát
Primitive không cần wrap, dùng trực tiếp từ `@antadmin/ui`:
`Row`, `Col`, `Space`, `Flex`, `Divider`, `Typography`.

## Build
- `vite build` (lib mode, ESM) + `vite-plugin-dts` sinh `dist/index.d.ts`.
- `vue`, `ant-design-vue`, `@antadmin/theme` để **external** (không bundle).
