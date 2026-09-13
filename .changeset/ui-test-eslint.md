---
'@antadmin/ui': patch
---

Bỏ `eslint-disable` khỏi test của `@antadmin/ui`; ngoại lệ lint cho stub antdv chuyển thành override có tên trong `eslint.config.mjs`

Không đổi API, component và file publish.

- 5 file test (`CChat`, `CFilterBar`, `CForm`, `CTable`, `CTableFilterDrawer`) bỏ dòng
  `/* eslint-disable vue/one-component-per-file */` ở đầu file, đúng quy ước repo cấm `eslint-disable`. Directive trong
  `CForm.test.ts` vốn không dùng tới (ESLint báo "Unused eslint-disable directive").
- Override `antadmin/ui-test-stubs` chỉ tắt `vue/one-component-per-file` cho `**/*.test.ts`, vì file test gom nhiều stub
  antdv trong factory `vi.mock('ant-design-vue')`. Component `.vue`, story và code nguồn vẫn áp rule.
- Stub `ATextarea`/`AAlert` trong `CChat.test.ts` khai báo `default` cho prop nên hết 2 cảnh báo `vue/require-default-prop`.
  `pnpm --filter @antadmin/ui exec eslint . --max-warnings 0` giờ sạch.
