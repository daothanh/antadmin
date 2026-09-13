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
  /** Màu nền thương hiệu (pill menu active); chữ trên nền này dùng navy `sidebarBottom`. */
  accent: string
  accentSoft: string
  /** Chữ/icon màu accent trên nền sáng (accentSoft, surface) — `accent` quá sáng để làm chữ. */
  accentText: string

  // Semantic
  success: string
  successSoft: string
  /** Chữ/icon màu success trên nền sáng (successSoft, surface). */
  successText: string
  warning: string
  warningSoft: string
  /** Chữ/icon màu warning trên nền sáng (warningSoft, surface). */
  warningText: string
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

    // Cam thương hiệu chỉ làm nền: chữ trắng trên nó chỉ 2.16:1 nên chữ trên pill menu dùng navy sidebarBottom (7.03:1),
    // chữ/icon cam dùng accentText (≥ 4.5:1 trên accentSoft, surface, infoSoft).
    accent: '#ff9800',
    accentSoft: '#fff1d6',
    accentText: '#9e5d02',

    // success/warning còn là seed antdv: làm tối seed thì tint nền antdv sinh ra (Alert, Tag…) xỉn theo, nên giữ nguyên và
    // tách màu chữ *Text (≥ 4.5:1 trên nền soft, surface, infoSoft). error đổi thẳng vì đỏ đậm vẫn cho tint nền như cũ.
    success: '#089b00',
    successSoft: '#ecfdf5',
    successText: '#087e02',
    warning: '#d97706',
    warningSoft: '#fff7ed',
    warningText: '#a55904',
    // ≥ 4.5:1 trên errorSoft, surface, infoSoft và khi làm nền cho chữ trắng (Badge, hover item danger của Dropdown antdv);
    // #ee0033 cũ chỉ 4.08:1 trên errorSoft.
    error: '#d71431',
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
  // Chữ trắng của nút danger ≥ 4.5:1 dọc cả dải, kể cả khi hover sáng lên (brightness 1.08); #f43f5e cũ chỉ 3.67:1.
  gradientDanger: 'linear-gradient(135deg, #cf1444, #d71431)',
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
    // Nền tối: màu gốc đã đủ sáng để làm chữ (≥ 4.5:1 trên nền soft, surface) nên *Text trùng màu gốc.
    accentText: '#ffa726',

    success: '#22c55e',
    successSoft: '#10241a',
    successText: '#22c55e',
    warning: '#fbbf24',
    warningSoft: '#2a2110',
    warningText: '#fbbf24',
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
  // error theme tối là màu chữ (sáng) nên không làm điểm cuối được (chữ trắng chỉ 2.77:1) → dùng chung dải với theme sáng.
  gradientDanger: 'linear-gradient(135deg, #cf1444, #d71431)',
  shadowCard: '0 12px 28px rgba(0, 0, 0, 0.35)',
  shadowRaised: '0 18px 40px rgba(0, 0, 0, 0.5)',
}

export const tokensByMode = {
  light: lightTokens,
  dark: darkTokens,
} as const
