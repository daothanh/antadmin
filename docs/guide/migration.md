# Migration Guide

Mỗi **major** của `@antadmin/*` có một mục migration. Các package `@antadmin/*` đi **lockstep**
(cùng version), nên nâng cấp đồng loạt.

## Nguyên tắc nâng cấp

1. Đọc mục migration của major đích (bên dưới).
2. Bump `@antadmin/nuxt-layer-base` (kéo theo ui/theme/composables cùng version).
3. Chạy `pnpm install`, rồi `pnpm typecheck` để bắt breaking ở mức type trước.
4. Test trên channel `next`/`beta` trước khi lên `latest` (xem [Release](/contributing/releasing)).

```bash
# thử bản beta
pnpm add @antadmin/nuxt-layer-base@beta
```

## Mẫu mục migration (cho core team)

> Khi phát hành major Y, thêm một mục theo mẫu này.

### vX → vY

**Breaking changes**
- _Mô tả thay đổi phá vỡ, lý do._

**Hành động cần làm**
- _Bước cụ thể team sản phẩm phải làm (đổi API, đổi config...)._

**Codemod / tự động hoá** (nếu có)
- _Lệnh/script hỗ trợ._

---

## v1 → v2

`2.0.0` lên major vì `@antadmin/eslint-config` chỉ còn hỗ trợ ESLint 10. Cùng đợt này, `CTable`, token màu và `useTable`
đổi hành vi nên trang hoặc CSS riêng của dự án có thể bị ảnh hưởng. `@antadmin/ai`, `@antadmin/tsconfig` và
`@antadmin/utils` không có breaking change riêng, chỉ lên `2.0.0` theo lockstep.

**Breaking changes**
- **ESLint 10**
  - `@antadmin/eslint-config` chỉ còn hỗ trợ **ESLint 10** (`eslint@^10`). Yêu cầu Node tối thiểu nâng lên **>= 20.19.0** (hoặc 22.13+ / 24).
  - Bộ rule đi kèm nâng major đồng bộ: `@eslint/js` 10, `eslint-plugin-vue` 10, `vue-eslint-parser` 10, `typescript-eslint` 8.69+ — recommended configs có thể báo thêm lỗi mới.
  - ESLint 10 tìm config bắt đầu từ thư mục của từng file linted (không còn chỉ theo cwd) — đảm bảo `eslint.config.mjs` của mỗi dự án/phân vùng vẫn được phát hiện đúng.
- **`CTable` là khung trang danh sách** (bọc trong `CCard`)
  - `class`/`style` gắn vào khung ngoài `.c-table`, không còn gắn vào `a-table`.
  - Prop `title` (chuỗi) và slot `#title` hiển thị ở header khung, không còn forward xuống `title` của `a-table`.
  - Bảng không có tiêu đề hay toolbar vẫn có viền và bóng của khung.
  - Phân trang mặc định có "Tổng số dòng N" và bộ chọn số dòng/trang. `pagination` truyền vào ghi đè từng key, `false`
    để tắt.
- **Token màu** đổi giá trị để đạt tương phản WCAG AA (≥ 4.5:1)

  | Token | Theme | 1.x | 2.0 |
  |---|---|---|---|
  | `error` | sáng | `#ee0033` | `#d71431` |
  | `link` | sáng | `#1576f4` | `#1068d6` |
  | `primary` | tối | `#4f76d1` | `#7090dc` |
  | `primaryHover` | tối | `#7b98df` | `#94ade6` |
  | `gradientPrimary` | tối | `#35549e → #4f76d1` | `#35549e → #4466b8` |
  | `gradientDanger` | sáng | `#f43f5e → #ee0033` | `#cf1444 → #d71431` |
  | `gradientDanger` | tối | `#f43f5e → #f87171` | `#cf1444 → #d71431` |

  - Theme tối: các nền primary có chữ trắng (header bảng, `CCard type="primary"`, nút primary thuần antdv, ngày đang
    chọn của DatePicker) chuyển sang `--antadmin-color-primary-active`.
  - `CSideNav`: item hover/đang chọn giữ nền cam, chữ và icon đổi từ trắng sang navy.
  - Interface `ColorTokens` có thêm field bắt buộc `accentText`, `successText`, `warningText`.
- **`useTable`** gửi sắp xếp cho fetcher khác trước
  - Bỏ sắp xếp một cột → `sortField` và `sortOrder` đều `undefined`. Bản 1.x vẫn gửi `sortField`.
  - Cột có `dataIndex` lồng (`['owner', 'name']`) → `sortField` là `'owner.name'`. Bản 1.x truyền nguyên mảng.
  - Bảng sắp xếp nhiều cột (`sorter.multiple`) → lấy cột đầu tiên. Bản 1.x không gửi sắp xếp.
- **Layer**
  - `app.vue` truyền locale `vi_VN` của antdv cho `<a-config-provider>`.
  - Form đăng nhập là `<AntAdminLoginForm>`. Bản 1.3.1 đặt nhầm tên file (`TascoLoginForm.vue`) nên trang `/auth/login`
    mặc định không hiện form.

**Hành động cần làm**
1. Nâng đồng loạt `@antadmin/*` cùng ESLint, rồi lint lại:

   ```bash
   # template scaffold của @antadmin/cli 2.x đã dùng sẵn các bản này
   pnpm add @antadmin/nuxt-layer-base@^2 @antadmin/ui@^2
   pnpm add -D @antadmin/eslint-config@^2 @antadmin/tsconfig@^2 eslint@^10

   # recommended rules thay đổi, có thể cần sửa code mới bị báo
   pnpm lint
   ```

   Nếu đang dùng rule/plugin custom viết cho ESLint 9, kiểm tra với [migration guide ESLint 10](https://eslint.org/docs/latest/use/migrate-to-10.0.0) (bỏ `context.getSourceCode()`, `SourceCode.getTokenOrCommentBefore()`...).
2. Rà các trang dùng `CTable`:
   - CSS ghép class của bảng với class antdv (vd `.orders-table.ant-table-wrapper`) → đổi sang selector con
     (`.orders-table .ant-table`).
   - Đang dùng slot `#title` hoặc `title` dạng hàm làm dòng tiêu đề bên trong bảng → chuyển thành tiêu đề khung.
   - `CTable` nằm trong một card khác → thêm `borderless` để khỏi hai lớp viền.

   ```diff
     <CCard title="Tổng quan">
   -   <CTable :columns="columns" :data-source="rows" />
   +   <CTable borderless :columns="columns" :data-source="rows" />
     </CCard>
   ```
3. Rà CSS riêng theo bảng cặp màu AA ở [Theme](/guide/theming):

   | Đang viết | Đổi thành |
   |---|---|
   | Chữ trắng trên nền `var(--antadmin-color-primary)` | Nền `var(--antadmin-color-primary-active)` |
   | Chữ `var(--antadmin-color-{accent,success,warning})` trên nền sáng | `var(--antadmin-color-{accent,success,warning}-text)` |
   | Chữ trắng trên nền `var(--antadmin-color-accent)` | Chữ `var(--antadmin-color-sidebar-bottom)` |
   | Mã hex chép từ token cũ (bảng trên) | Biến `var(--antadmin-color-*)` tương ứng |

   Dự án có test ảnh chụp giao diện thì cập nhật lại ảnh gốc.
4. Kiểm tra API backend của các bảng nhận được request không có `sortField`/`sortOrder`, và `sortField` dạng `a.b` với cột
   lồng.
5. Dự án tự override `app.vue` → thêm locale:

   ```diff
     <script setup lang="ts">
     import { theme } from 'ant-design-vue'
   + import viVN from 'ant-design-vue/es/locale/vi_VN'
     …
     </script>

     <template>
   -   <a-config-provider :theme="antdTheme">
   +   <a-config-provider
   +     :theme="antdTheme"
   +     :locale="viVN"
   +   >
   ```
6. Dự án tự tạo `pages/auth/login.vue` và đang gọi `<TascoLoginForm>` → đổi sang `<AntAdminLoginForm>`.

---

## v0 → v1 (ví dụ)

**Breaking changes**
- `useApi` trả về instance gọi trực tiếp thay vì object `{ get, post }` (ví dụ minh hoạ).

**Hành động cần làm**
```diff
- const { get } = useApi()
- const data = await get('/orders')
+ const api = useApi()
+ const data = await api('/orders')
```
