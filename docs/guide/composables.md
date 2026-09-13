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

Bộ lọc dựng sẵn của `CTable` (drawer + thanh điều kiện — xem [CTable](/guide/ui#bo-loc-dung-san-drawer-thanh-đieu-kien-loc)):

```ts
const { dataSource, loading, pagination, filterValues, onChange, onFilter } = useTable<Order>(
  (query) => api('/orders', { query }),
  { pageSize: 10, filters: { status: 1 } }, // bộ lọc mặc định, có hiệu lực ngay lần load đầu
)
```

```vue
<CTable
  :columns="columns" :data-source="dataSource"
  :loading="loading" :pagination="pagination"
  :filter-fields="filterFields" :filter-values="filterValues"
  show-filter row-key="id"
  @change="onChange" @update:filter-values="onFilter"
/>
```

| Trả về | Mô tả |
|---|---|
| `dataSource`, `loading`, `error`, `total` | State dữ liệu; lỗi fetcher quy về `AppError` |
| `query` | `TableQuery` gửi cho fetcher: `page`, `pageSize`, `sortField?`, `sortOrder?`, `filters?` |
| `pagination` | Bind `:pagination` của `CTable` |
| `filterValues` | Bộ lọc form đang áp dụng (chỉ đọc) — bind `:filter-values` |
| `onChange(pagination, filters?, sorter?)` | Bind `@change`: cập nhật trang/sort/filter cột rồi tải lại |
| `onFilter(values)` | Bind `@update:filter-values`: thay bộ lọc form, về trang 1 rồi tải lại |
| `load()` / `reload()` | Tải lại giữ trang / về trang 1 |

- `query.filters` = filter cột của `a-table` gộp với bộ lọc form (trùng key thì bộ lọc form thắng); không
  có bộ lọc nào thì `undefined`. Đổi trang/sort không làm mất bộ lọc form.
- `onChange`/`onFilter`/`reload` trả `Promise` ném `AppError` khi fetcher lỗi — bind thẳng vào sự kiện
  template thì lỗi đi qua error handler chung của app.
