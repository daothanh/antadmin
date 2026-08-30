# Composables

Auto-import qua layer (không cần import thủ công).

## useApi

`$fetch` cấu hình sẵn: baseURL từ `runtimeConfig.public.apiBaseURL` (mặc định `/api`), SSR forward
cookie, lỗi → `AppError`.

```ts
const api = useApi()
const orders = await api('/orders', { query: { page: 1 } })
```

## useAuth

```ts
const { user, isAuthenticated, login, loginWithPassword, logout, refresh, fetchUser } = useAuth()
```

State `user` (kiểu `AuthUser`) được layer khởi tạo từ session. `login` điều hướng tới trang form
`/auth/login`; `loginWithPassword(credentials)` đăng nhập trực tiếp qua BFF (xem [Auth](/guide/auth)).

## usePermission

```ts
const { can, canAll, canAny, hasRole } = usePermission()
if (can('order.write')) { /* ... */ }
```

## useTable

State phân trang/sort/filter + props để bind `CTable`.

```ts
interface Order { id: number; code: string }
const api = useApi()
const { dataSource, loading, pagination, onChange, reload } = useTable<Order>(
  (query) => api('/orders', { query }),
  { pageSize: 10 },
)
```

```vue
<CTable
  :columns="columns" :data-source="dataSource"
  :loading="loading" :pagination="pagination"
  row-key="id" @change="onChange"
/>
```
