# @antadmin/utils

Helper TypeScript thuần (zero runtime dep, không phụ thuộc Nuxt/Vue).

## API
- `AppError` — lớp lỗi chuẩn hoá (`status`, `code`, `data`).
- `toAppError(input)` — quy mọi lỗi (ofetch response, Error, string) về `AppError`.
- `isAppError(input)` — type guard.
- Types: `Nullable<T>`, `Maybe<T>`, `Paginated<T>`.
