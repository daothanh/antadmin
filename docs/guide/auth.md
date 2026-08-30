# Auth & Permission

Auth được layer cung cấp dưới dạng **form đăng nhập first-party + Nitro BFF**. Team sản phẩm
**không** tự viết flow đăng nhập — chỉ cấu hình endpoint IAM qua env và (tuỳ chọn) tuỳ biến form.

## Mô hình BFF

Credential (mật khẩu/OTP) **chỉ POST tới Nitro BFF** qua HTTPS; BFF đổi lấy token ở IAM rồi
**seal token vào cookie httpOnly** (AES-256-GCM). Client **không bao giờ** giữ accessToken.

| Route BFF | Vai trò |
|---|---|
| `POST /auth/login` | Nhận credential → IAM login → userInfo → seal session |
| `GET /auth/clients` | Danh sách ứng dụng cho dropdown (proxy IAM, lọc client có tên) |
| `POST /auth/otp/send` | Gửi OTP (vd Telegram) trước khi đăng nhập |
| `GET /auth/session` | Trả user hiện tại (lấy roles/permissions tươi qua userInfo) |
| `GET /auth/logout` | Xoá session |

## Khai báo route

```ts
// route công khai (vd trang đăng nhập)
definePageMeta({ auth: false })

// route cần quyền
definePageMeta({ permissions: ['order.read'] })
```

- `auth.global`: chưa đăng nhập → điều hướng `/auth/login` (Vue page).
- `permission.global`: thiếu quyền → lỗi 403.

::: warning
`auth.global`/`permission.global` chỉ **gating phía client** cho UX. Backend **phải** tự enforce
quyền trên mỗi API.
:::

## Cấu hình (đổi backend chỉ là đổi env)

Endpoint IAM thật + cách bóc field nằm trong `runtimeConfig.auth` (server-only). Route BFF ở trên
là **hợp đồng cố định** — đổi IAM không đụng client.

```bash
# Base URL bọc cả /iam và /auth; endpoint mặc định đã khớp IAM AntAdmin
NUXT_AUTH_BASE_URL=https://api.antadmin.com/cop

# Chỉ đặt khi backend khác cấu trúc mặc định:
# NUXT_AUTH_ENDPOINTS_LOGIN=/auth/auth/login-v1
# NUXT_AUTH_ENDPOINTS_USER_INFO=/iam/user/userInfo
# NUXT_AUTH_ENDPOINTS_CLIENTS=/iam/client/findAll?status=1
# NUXT_AUTH_ENDPOINTS_OTP_SEND=/auth/auth/login/request
# NUXT_AUTH_MAPPING_TOKEN=body.tokenData.access_token
# NUXT_AUTH_MAPPING_ROLES=body.listRole
# NUXT_AUTH_MAPPING_PERMISSIONS=body.authorization
```

`mapping.*` dùng **dot-path** để bóc token/roles/permissions từ response. roles/permissions chấp
nhận mảng string hoặc mảng object (tự lấy `.code`/`.rsCode`/`.name`).

### Cấu hình form (client đọc được)

```bash
NUXT_PUBLIC_AUTH_METHODS=google,telegram      # phương thức xác thực bật trên form
NUXT_PUBLIC_AUTH_SHOW_CLIENT_SELECT=true       # dropdown "Chọn ứng dụng"
# NUXT_PUBLIC_AUTH_DEFAULT_CLIENT_CODE=WP_HRM  # cố định 1 app, ẩn dropdown
```

## Component `<AntAdminLoginForm>`

Trang `/auth/login` mặc định chỉ là vỏ mỏng bọc `<AntAdminLoginForm>` (auto-import). Tuỳ biến qua
props (fallback về `public.auth`):

```vue
<AntAdminLoginForm
  title="TASCO AUTO"
  subtitle="Đăng nhập"
  :methods="['google', 'telegram']"
  :show-client-select="true"
  @success="() => navigateTo('/')"
/>
```

Muốn đổi bố cục hoàn toàn: dự án tạo `app/pages/auth/login.vue` của riêng mình (Nuxt override) mà
vẫn dùng lại `<AntAdminLoginForm>`.

## Đăng nhập bằng code

```ts
const { loginWithPassword, isAuthenticated, user } = useAuth()

await loginWithPassword({
  clientId: 'WP_HRM',   // CODE ứng dụng (không phải uuid)
  username: 'thanhdx',
  password: '••••••',
  method: 'google',     // 'google' | 'telegram'
  otp: '123456',
})
```

- **Google Authentication**: người dùng tự sinh mã trong app → nhập trực tiếp.
- **Telegram**: bấm "Gửi mã" (`/auth/otp/send`) → nhận `transactionId` → gửi kèm khi đăng nhập.

## Kiểm tra quyền (permission)

`permissions` là danh sách **URI** (chỉ `type=web`), so khớp **exact**. Ba điểm gating:

### 1. Truy cập trang (route)

```ts
definePageMeta({ permission: '/attendance-summary/search' })   // 1 URI
definePageMeta({ permissions: ['/a', '/b'] })                  // cần TẤT CẢ
```
Thiếu quyền → `permission.global` ném 403.

### 2. Link / menu điều hướng

Khai `permission` trên `NavItem`; layout tự ẩn item user không có quyền:

```ts
nav: [{ label: 'Chấm công', path: '/attendance', permission: '/attendance-summary/search' }]
```
Lọc list link bất kỳ: `usePermission().filterByPermission(items)`.

### 3. Action button

```vue
<CButton v-can="'/attendance-summary/update'">Sửa</CButton>       <!-- ẩn nếu thiếu -->
<CButton v-can:disable="'/attendance-summary/delete'">Xoá</CButton> <!-- disable nếu thiếu -->

<Can permission="/attendance-summary/update">
  <CButton>Sửa</CButton>
  <template #fallback><span>Không có quyền</span></template>
</Can>
```

### API `usePermission`

```ts
const { can, canAll, canAny, canAccess, hasRole, hasAnyRole, filterByPermission } = usePermission()
can('/attendance-summary/update')   // exact match
```

### Super-role (bỏ qua mọi check)

```bash
NUXT_PUBLIC_AUTH_SUPER_ROLES=OAP_ADMIN,org_admin
```
User có role trong danh sách → `can()` luôn true.

::: warning
Toàn bộ chỉ là **gating client (UX)**. Backend **phải** tự enforce quyền trên mỗi request.
:::

## Mock mode (dev)

```bash
NUXT_AUTH_MOCK=true
```

`/auth/login` + `/auth/clients` trả dữ liệu giả (user `admin` với `order.read`/`order.write`) —
chạy end-to-end không cần IAM thật.

## Ràng buộc kích thước cookie

accessToken JWT (~2.4KB) + hàng trăm permissions **vượt giới hạn 4KB của cookie**. Vì vậy cookie
sealed **chỉ giữ token + identity tối thiểu** (id/name/email); **roles/permissions lấy tươi ở
`/auth/session`** qua userInfo mỗi lần load. Không lưu refreshToken (token IAM sống 24h → hết hạn
thì đăng nhập lại).

## Thay provider khác

`AuthProvider` là interface abstract (`login`/`loginWithPassword`/`logout`/`refresh`/`getUser`).
Tập đoàn cắm SAML/cổng riêng bằng adapter khác mà không đổi API consumer.
