// Nuxt layer nền AntAdmin. Team sản phẩm: `extends: ['@antadmin/nuxt-layer-base']`.
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  // Giữ ssr:true để Nitro/BFF (token httpOnly cookie, proxy backend) hoạt động —
  // SSR ≠ BFF. Phần RENDER component thì mặc định CSR (xem routeRules) vì
  // Ant Design Vue (cssinjs) hỗ trợ SSR chưa tốt: FOUC, hydration mismatch
  // (Teleport/responsive), message/notification mất theme. App nội bộ sau đăng
  // nhập không cần SEO nên CSR là lựa chọn an toàn nhất.
  ssr: true,

  // HYBRID RENDERING: mặc định client-render toàn bộ → né lỗi antd SSR, không FOUC.
  // BFF (/api, /auth) vẫn chạy bình thường. Trang công khai cần SEO/first-paint:
  // team override trong dự án, vd `routeRules: { '/landing': { ssr: true } }`.
  routeRules: {
    '/**': { ssr: false },
  },

  modules: ['@ant-design-vue/nuxt', '@nuxt/fonts'],

  // Stylesheet nền: base.css (reset/scrollbar/font) + style scoped của @antadmin/ui.
  // Biến --antadmin-* được app.vue inject runtime qua useHead(cssVarsText).
  css: ['@antadmin/theme/base.css', '@antadmin/ui/style.css'],

  // @nuxt/fonts: self-host font Quicksand (body) + Montserrat (heading) khớp
  // design token. Khai báo families tường minh vì font-family đến từ biến
  // --antadmin-* inject runtime (auto-scan CSS có thể bỏ sót).
  fonts: {
    families: [
      {
        name: 'Quicksand',
        provider: 'google',
        weights: [300, 400, 500, 600, 700],
        subsets: ['vietnamese', 'latin'],
      },
      {
        name: 'Montserrat',
        provider: 'google',
        weights: [400, 500, 600, 700],
        subsets: ['vietnamese', 'latin'],
      },
    ],
    // Cho phép dò font khai báo qua CSS variable (--antadmin-font-*) trong base.css.
    experimental: {
      processCSSVariables: true,
    },
  },

  // Transpile package runtime @antadmin/* (cài từ registry sẽ bị externalize → Node nạp
  // thẳng nuxt/dist/app gây ERR_MODULE_NOT_FOUND ở dev SSR). Transpile để Vite xử lý
  // như khi dùng workspace symlink.
  build: {
    transpile: ['@antadmin/ui', '@antadmin/composables'],
  },

  // antdv: tách style cho SSR (tránh FOUC/hydration mismatch).
  antd: {
    extractStyle: true,
  },

  // Auto-import composables dùng chung.
  imports: {
    presets: [
      {
        from: '@antadmin/composables',
        imports: ['useApi', 'useAuth', 'usePermission', 'useTable', 'useThemeMode'],
      },
    ],
  },

  runtimeConfig: {
    // server-only — override qua env NUXT_SESSION_SECRET.
    // Khoá để mã hoá/ký cookie session (AES-256-GCM). BẮT BUỘC ở production
    // (>= 32 ký tự ngẫu nhiên). Rỗng ở dev → dùng secret tạm + cảnh báo.
    session: {
      secret: '',
    },
    // server-only — override qua env NUXT_OIDC_*. Phần OIDC còn sót từ trước khi chuyển sang
    // đăng nhập IAM (block `auth` bên dưới): chỉ /auth/logout (chuyển tới end_session_endpoint
    // của IdP khi có issuer) và nhánh refresh token của /api/** còn đọc. Session IAM không giữ
    // refresh token nên nhánh refresh không chạy.
    oidc: {
      issuer: '',
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      scopes: 'openid profile email',
      postLogoutRedirectUri: '',
      // Bỏ qua IdP khi logout/refresh token (NUXT_OIDC_MOCK=true). KHÔNG bỏ qua đăng nhập:
      // dev không có IAM thì đặt NUXT_AUTH_MOCK=true.
      mock: false,
    },
    // ĐĂNG NHẬP BẰNG FORM (first-party). server-only — override qua NUXT_AUTH_*.
    // Endpoint/field mapping cấu hình theo dự án: đổi backend chỉ là đổi env,
    // route BFF (/auth/login, /auth/clients...) là hợp đồng cố định.
    auth: {
      // Base URL cổng (bọc cả /iam và /auth), vd https://api.antadmin.com/cop
      baseURL: '',
      // Đường dẫn tương đối trên baseURL. Để trống endpoint nào → tính năng đó ẩn.
      // Mặc định khớp IAM AntAdmin.
      endpoints: {
        login: '/auth/auth/login-v1', // POST login-v1
        userInfo: '/iam/user/userInfo', // POST, header authorization thô (no Bearer)
        clients: '/iam/client/findAll?status=1', // GET danh sách ứng dụng
        otpSend: '/auth/auth/login/request', // POST gửi OTP Telegram — trống nếu không dùng
      },
      // Bóc field từ response (dot-path từ gốc JSON). Override qua
      // NUXT_AUTH_MAPPING_TOKEN, NUXT_AUTH_MAPPING_ROLES... khi backend khác cấu trúc.
      // roles=listRole (object .code), permissions=authorization (object .rsCode).
      // token/refresh/expiresIn nằm trong body.tokenData của login-v1 (đã verify).
      mapping: {
        token: 'body.tokenData.access_token',
        refresh: 'body.tokenData.refresh_token',
        expiresIn: 'body.tokenData.expires_in',
        id: 'body.userId',
        name: 'body.fullName',
        email: 'body.email',
        roles: 'body.listRole',
        permissions: 'body.authorization',
        // roles/permissions là mảng object → lấy field làm mã.
        roleKey: 'code', // listRole[].code = AIWSP_ADMIN
        permissionKey: 'uri', // authorization[].uri = /attendance-summary/search
        // Chỉ lấy permission type='web' (gating uri/link/action button).
        permissionType: 'web',
        permissionTypeKey: 'type',
      },
      // Map phương thức → mã authenMethod IAM. google=1 (đã xác nhận),
      // telegram=2 (giả định — chỉnh khi có spec).
      authenMethod: {
        google: 1,
        telegram: 2,
      },
      // DEV: bỏ qua IAM, tạo session giả (đặt NUXT_AUTH_MOCK=true).
      mock: false,
    },
    // Backend gateway thật mà /api/** proxy tới. Override qua NUXT_API_PROXY_TARGET.
    apiProxyTarget: '',
    public: {
      // BFF: client gọi /api, Nitro proxy sang apiProxyTarget.
      apiBaseURL: '/api',
      // Cấu hình form đăng nhập (client đọc được). Override qua NUXT_PUBLIC_AUTH_*.
      auth: {
        // Phương thức xác thực bật trên form: 'google' | 'telegram'. Rỗng → ẩn ô OTP.
        methods: 'google,telegram',
        // Hiện dropdown "Chọn ứng dụng". Dự án 1 app → đặt false.
        showClientSelect: true,
        // Cố định 1 client (code) khi không hiện dropdown. Rỗng → người dùng chọn.
        defaultClientCode: '',
        // Role bỏ qua mọi check quyền (admin). Chuỗi 'OAP_ADMIN,org_admin'.
        // Override qua NUXT_PUBLIC_AUTH_SUPER_ROLES.
        superRoles: '',
      },
    },
  },
})
