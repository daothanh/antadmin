---
'@antadmin/ui': patch
---

Sửa `index.d.ts` của `@antadmin/ui` lỗi TS2749 (`$nextTick: nextTick`); build Storybook không còn chạy plugin d.ts

Không đổi API và runtime. Type của `components` giữ nguyên ý nghĩa.

- **d.ts publish hỏng**: map `components` (install.ts) để TS tự suy luận nên d.ts in lại nguyên cây type từng component.
  Type của `CTable` chứa instance `CButton` (template ref), trong đó có `typeof import('vue').nextTick`. api-extractor
  (`rollupTypes`) viết lại thành `$nextTick: nextTick` (mất `typeof`), consumer đặt `skipLibCheck: false` gặp TS2749.
  Nay `components` khai báo type tường minh `{ CTable: typeof CTable, … }`: `index.d.ts` hết lỗi và gọn từ 1815 xuống
  1007 dòng.
- **Chốt chặn lúc build**: `vite.config.ts` báo lỗi `[@antadmin/ui]` khi d.ts sinh ra có `typeof import(...)`, không để
  phát hành d.ts hỏng. Test/story không còn sinh d.ts.
- **Storybook** (job Docs trên GitHub fail): `.storybook/main.ts` bỏ plugin `vite:dts` kế thừa từ `vite.config.ts`.
  Trước đây Storybook bỏ `build.lib` nên plugin chạy api-extractor lại trên `dist/index.d.ts`, ghi đè file đó và đổ
  `.d.ts` vào `storybook-static`.
