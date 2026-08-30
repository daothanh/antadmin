---
'@antadmin/ui': patch
---

Sửa lỗi TS7022 (`'name' implicitly has type 'any'`) ở bước vite:dts khi build, do vòng suy luận type của vue-tsc với `v-for="(_, name) in $slots"` trong CForm/CTable. Chuyển sang lặp `useSlots()` với type tường minh; hành vi forward slot (kể cả slotProps) giữ nguyên, có test kèm theo.
