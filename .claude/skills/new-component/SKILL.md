---
name: new-component
description: Tạo component C* mới cho @antadmin/ui đúng chuẩn framework — component + stories + test + đăng ký 3 chỗ + changeset. Dùng khi cần thêm component vào design system AntAdmin.
---

# Tạo component C* mới cho @antadmin/ui

Nhận tên component (vd `/new-component CDateRangeLabel`) và mô tả chức năng. Nếu thiếu mô tả, hỏi
người dùng component làm gì trước khi viết.

## Bước 0 — Kiểm tra trước khi viết

1. **Đã có chưa?** Xem `packages/ui/src/index.ts`: component thương hiệu (`C*` có style riêng)
   và cả danh sách **re-export primitive antdv** (CInput, CSelect, CModal…). Nếu nhu cầu chỉ là
   dùng một primitive antdv chưa được re-export → chỉ cần thêm alias vào khối re-export trong
   `index.ts`, KHÔNG tạo wrapper mới.
2. **Có đáng vào core không?** Core chỉ giữ thứ dùng chung nhiều sản phẩm. Component nghiệp vụ
   đặc thù 1 sản phẩm → từ chối, gợi ý để ở repo sản phẩm.
3. Tên phải theo dạng `C<PascalCase>`.

## Bước 1 — Component: `packages/ui/src/components/<Tên>.vue`

Theo đúng khuôn các component hiện có (xem `CStatus.vue` làm mẫu chuẩn):

- `<script setup lang="ts">`, có `defineOptions({ name: '<Tên>' })`.
- Props: `withDefaults(defineProps<{...}>(), {...})`, JSDoc tiếng Việt cho prop không tự giải thích.
- Comment đầu file 1–2 dòng mô tả component, **tiếng Việt**.
- Import antdv trực tiếp trong package này là ĐƯỢC PHÉP (chỉ nơi này được phép).
- Style `scoped`, class theo BEM tiền tố `c-<tên>`: `.c-foo`, `.c-foo__phần-tử`, `.c-foo--biến-thể`.
- **Màu sắc/spacing chỉ dùng CSS vars `--antadmin-*`** (xem `packages/theme/src/css-vars.ts`),
  không hardcode mã màu. Cần token mới → thêm vào `@antadmin/theme` trước.
- KHÔNG cấu hình style qua `theme.components` của ConfigProvider — antd-vue bỏ qua nó;
  override antdv bằng global CSS trong theme nếu thật sự cần.
- Không thêm dependency icon/lib mới — giữ @antadmin/ui gọn (ưu tiên CSS thuần như chấm của CStatus).

## Bước 2 — Stories: `<Tên>.stories.ts` (bắt buộc)

Khuôn theo `CStatus.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import <Tên> from './<Tên>.vue'

const meta: Meta<typeof <Tên>> = {
  title: 'Components/<Tên>',
  component: <Tên>,
}
export default meta

type Story = StoryObj<typeof <Tên>>
// Mỗi story thể hiện 1 nhóm trạng thái/biến thể chính.
```

## Bước 3 — Test: `<Tên>.test.ts` (bắt buộc — coverage gate)

Khuôn theo `CStatus.test.ts`: Vitest + `@vue/test-utils`.

- **Stub primitive antdv bằng `vi.mock('ant-design-vue', ...)`** để test logic thuần của wrapper,
  không test lại antdv. Lưu ý: `vi.mock` phải đứng TRƯỚC `import <Tên>`.
- Test theo hành vi qua props/class/text render, không test chi tiết implementation.
- Phủ: giá trị mặc định, từng prop chính, biến thể/trạng thái, edge case.

## Bước 4 — Đăng ký 3 chỗ (thiếu 1 là lỗi âm thầm)

1. `packages/ui/src/index.ts` — `export { default as <Tên> } from './components/<Tên>.vue'`
   (đúng khối "Component thương hiệu AntAdmin", giữ thứ tự alphabet). Export kèm type nếu có
   (`export type { ... }`).
2. `packages/ui/src/install.ts` — thêm import + thêm vào object `components` (để layer đăng ký global).
3. `packages/nuxt-layer-base/antadmin.d.ts` — thêm vào import từ `@antadmin/ui` VÀ vào
   `interface GlobalComponents` (để IDE/vue-tsc nhận diện component global trong app sản phẩm).

## Bước 5 — Verify + changeset

```bash
pnpm --filter @antadmin/ui test        # test + coverage gate
pnpm --filter @antadmin/ui lint
pnpm --filter @antadmin/ui typecheck
pnpm --filter @antadmin/nuxt-layer-base typecheck
```

Tạo changeset (KHÔNG chạy lệnh interactive `pnpm changeset` — viết file trực tiếp):
`.changeset/<slug-mô-tả>.md`

```md
---
"@antadmin/ui": minor
"@antadmin/nuxt-layer-base": patch
---

Thêm component <Tên>: <mô tả ngắn gọn tiếng Việt>.
```

## Bước 6 — Báo cáo

Liệt kê file đã tạo/sửa, kết quả test/lint/typecheck, và nhắc: xem nhanh bằng
`pnpm --filter @antadmin/ui storybook`. KHÔNG tự commit — chờ người dùng yêu cầu.
