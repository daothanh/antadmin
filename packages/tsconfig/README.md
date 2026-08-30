# @antadmin/tsconfig

Cấu hình TypeScript dùng chung cho framework AntAdmin.

## Cách dùng

**Package TS thuần** (utils, composables):
```json
{ "extends": "@antadmin/tsconfig/base" }
```

**Thư viện Vue** (ui):
```json
{ "extends": "@antadmin/tsconfig/vue-lib" }
```

**App Nuxt** — kết hợp với tsconfig Nuxt tự sinh (`.nuxt/tsconfig.json`):
```json
{ "extends": ["@antadmin/tsconfig/nuxt", "./.nuxt/tsconfig.json"] }
```
> Nuxt tự sinh phần lớn cấu hình (paths, types). File `nuxt.json` chỉ siết thêm
> `strict`/`noUnusedLocals`... để thống nhất convention giữa các app.
