// Design tokens — SINGLE SOURCE OF TRUTH cho thương hiệu AntAdmin.
// Mọi nơi (antdv ConfigProvider, CSS variables, scoped style của @antadmin/ui)
// đều suy ra từ đây. Đổi brand → chỉ sửa file này.
//
// Palette nền: navy (#203368) + accent cam (#ff9800) — nhận diện AntAdmin.
// Cấu trúc token bám sát nhu cầu thực tế của sản phẩm nội bộ (tham khảo OneAuto):
// có đủ surface/text/line nhiều cấp, semantic soft, gradient và shadow.

export interface ColorTokens {
  // Thương hiệu
  primary: string
  primaryHover: string
  primaryActive: string
  /** Nền mờ của primary (chip, hover nhẹ). */
  primarySoft: string

  // Accent (điểm nhấn cam — CTA phụ, badge, menu active)
  accent: string
  accentSoft: string

  // Semantic
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  error: string
  errorSoft: string
  info: string
  infoSoft: string
  link: string
  linkSoft: string

  // Chữ (nhiều cấp độ tương phản)
  text: string
  textSecondary: string
  textMuted: string
  textSubtle: string

  // Bề mặt
  /** Nền mặc định của card/panel. */
  surface: string
  /** Nền nổi (popover/dropdown/modal). */
  surfaceElevated: string
  /** Nền dịu (section, header bảng nhạt). */
  surfaceMuted: string
  /** Nền trang. */
  page: string

  // Đường kẻ
  border: string
  borderStrong: string

  // Sidebar (dải logo + menu) — navy sâu, gradient dọc.
  sidebarTop: string
  sidebarBottom: string
}

// Mật độ (padding / height / margin) của các component antd. Tinh chỉnh 1 chỗ:
// - controlHeight* → áp qua GLOBAL token (antd honor được).
// - phần còn lại (card/form/table/modal) → áp qua GLOBAL CSS trong base.css
//   (vì ant-design-vue 4.x BỎ QUA theme.components). Tất cả phát ra CSS vars
//   `--antadmin-*` để base.css dùng.
export interface DensityTokens {
  /** Chiều cao control: nhỏ / mặc định / lớn (px) — Input/Select/Button/Picker. */
  controlHeightSM: number
  controlHeight: number
  controlHeightLG: number
  /** Padding thân Card (px). */
  cardPaddingBlock: number
  cardPaddingInline: number
  /** Chiều cao header Card (px). */
  cardHeadingHeight: number
  /** Cỡ chữ tiêu đề Card (px). */
  cardHeadingFontSize: number
  /** Khoảng cách dưới mỗi Form item (px). */
  formItemMarginBottom: number
  /** Padding ô Table (px). */
  tableCellPaddingBlock: number
  tableCellPaddingInline: number
  /** Padding thân Modal / Drawer (px). */
  modalBodyPadding: number
}

export interface AntAdminTokens {
  color: ColorTokens
  /** Bo góc cơ bản (px). */
  radius: number
  /** Bo góc lớn (card, modal) (px). */
  radiusLg: number
  fontFamily: string
  /** Font cho tiêu đề/heading (có thể trùng fontFamily). */
  fontFamilyHeading: string
  /** Cỡ chữ cơ bản (px). */
  fontSize: number
  /** Chiều cao control cơ bản (px) — alias của density.controlHeight. */
  controlHeight: number
  /** Mật độ component (height/padding/margin). */
  density: DensityTokens
  /** Đơn vị spacing cơ bản (px). */
  spacingUnit: number
  /** Gradient cho nút/hero primary. */
  gradientPrimary: string
  /** Gradient cho nút danger. */
  gradientDanger: string
  /** Shadow card. */
  shadowCard: string
  /** Shadow phần tử nổi (dropdown/modal). */
  shadowRaised: string
}

const fontStack =
  "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
const fontHeadingStack =
  "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

// Mật độ dùng chung cho cả light/dark (không phụ thuộc màu).
// Giảm so với mặc định antd (card/form/modal 24px) cho giao diện gọn.
const density: DensityTokens = {
  controlHeightSM: 28,
  controlHeight: 36,
  controlHeightLG: 44,
  cardPaddingBlock: 12,
  cardPaddingInline: 16,
  cardHeadingHeight: 36,
  cardHeadingFontSize: 14,
  formItemMarginBottom: 16,
  tableCellPaddingBlock: 8,
  tableCellPaddingInline: 8,
  modalBodyPadding: 16,
}

export const lightTokens: AntAdminTokens = {
  color: {
    primary: '#203368',
    primaryHover: '#2f4b8f',
    primaryActive: '#182544',
    primarySoft: '#eef3fb',

    accent: '#ff9800',
    accentSoft: '#fff1d6',

    success: '#089b00',
    successSoft: '#ecfdf5',
    warning: '#d97706',
    warningSoft: '#fff7ed',
    error: '#ee0033',
    errorSoft: '#fff1f0',
    info: '#0f4c81',
    infoSoft: '#e8f2ff',
    // ≥ 4.5:1 trên surface, surfaceMuted, page và linkSoft (#1576f4 cũ chỉ 4.26:1 trên surface).
    link: '#1068d6',
    linkSoft: '#e8f2ff',

    text: '#10213f',
    textSecondary: '#4b5563',
    textMuted: '#5f6b85',
    textSubtle: '#9ca3af',

    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceMuted: '#f6f8fc',
    page: '#edf2f8',

    border: '#d8deea',
    borderStrong: '#bcc6da',

    sidebarTop: '#213368',
    sidebarBottom: '#182544',
  },
  radius: 0,
  radiusLg: 0,
  fontFamily: fontStack,
  fontFamilyHeading: fontHeadingStack,
  fontSize: 14,
  controlHeight: 36,
  density,
  spacingUnit: 8,
  gradientPrimary: 'linear-gradient(135deg, #203368, #2f4b8f)',
  gradientDanger: 'linear-gradient(135deg, #f43f5e, #ee0033)',
  shadowCard: '0 12px 28px rgba(16, 33, 63, 0.08)',
  shadowRaised: '0 18px 40px rgba(16, 33, 63, 0.14)',
}

export const darkTokens: AntAdminTokens = {
  color: {
    // Nền tối đảo vai trò: primary/primaryHover là màu CHỮ/icon (≥ 4.5:1 trên primarySoft, surface, surfaceElevated) nên
    // quá sáng để đặt chữ trắng lên; nền có chữ trắng dùng primaryActive (≥ 7:1) — xem base.css và gradientPrimary.
    primary: '#7090dc',
    primaryHover: '#94ade6',
    primaryActive: '#35549e',
    primarySoft: '#1a2740',

    accent: '#ffa726',
    accentSoft: '#3a2c12',

    success: '#22c55e',
    successSoft: '#10241a',
    warning: '#fbbf24',
    warningSoft: '#2a2110',
    error: '#f87171',
    errorSoft: '#2c1416',
    info: '#60a5fa',
    infoSoft: '#13243d',
    link: '#60a5fa',
    linkSoft: '#13243d',

    text: '#f8fafc',
    textSecondary: '#c0cadb',
    textMuted: '#9aa6bf',
    textSubtle: '#6b7689',

    surface: '#162033',
    surfaceElevated: '#1a2740',
    surfaceMuted: '#111827',
    page: '#0f1724',

    border: '#31415f',
    borderStrong: '#4b5f86',

    sidebarTop: '#1c2c52',
    sidebarBottom: '#0e1a33',
  },
  radius: 0,
  radiusLg: 0,
  fontFamily: fontStack,
  fontFamilyHeading: fontHeadingStack,
  fontSize: 14,
  controlHeight: 36,
  density,
  spacingUnit: 8,
  // Không dùng primary làm điểm cuối: chữ trắng của CButton primary phải ≥ 4.5:1 dọc cả dải (kể cả khi hover sáng lên).
  gradientPrimary: 'linear-gradient(135deg, #35549e, #4466b8)',
  gradientDanger: 'linear-gradient(135deg, #f43f5e, #f87171)',
  shadowCard: '0 12px 28px rgba(0, 0, 0, 0.35)',
  shadowRaised: '0 18px 40px rgba(0, 0, 0, 0.5)',
}

export const tokensByMode = {
  light: lightTokens,
  dark: darkTokens,
} as const
