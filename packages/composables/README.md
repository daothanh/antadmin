# @antadmin/composables

Composable dùng chung. Phụ thuộc context Nuxt (`nuxt/app`) — được auto-import qua
`@antadmin/nuxt-layer-base`. **Không** phụ thuộc `@antadmin/ui`.

## API
| Composable | Mô tả |
|---|---|
| `useApi(options?)` | `$fetch` cấu hình sẵn: baseURL từ runtimeConfig (BFF `/api`), SSR forward cookie (`useRequestFetch`), lỗi → `AppError`. |
| `useAuth()` | `user`, `isAuthenticated`, `login/logout/refresh/fetchUser`. Uỷ quyền cho `AuthProvider` (inject qua layer). |
| `usePermission()` | `can/canAll/canAny/hasRole` — guard quyền, không chứa flow login. |
| `useTable(fetcher, options?)` | State phân trang/sort/filter, trả `pagination`+`onChange` để bind CTable. |

## Hợp đồng AuthProvider
`useAuth` đọc provider tại `nuxtApp.$antadminAuth` (layer inject). Interface: `login/logout/handleCallback/refresh/getUser` — cắm OIDC mặc định hoặc SAML/cổng riêng sau.

## Ví dụ useTable + useApi
```ts
const api = useApi()
const { dataSource, loading, pagination, onChange } = useTable<User>(
  (q) => api('/users', { query: q }),
)
```
```vue
<CTable :data-source="dataSource" :loading="loading" :pagination="pagination" @change="onChange" />
```

> Lưu ý: composable cần context Nuxt nên chỉ verify đầy đủ ở playground (9.6). Bản build chỉ kiểm tra typecheck/bundle.
