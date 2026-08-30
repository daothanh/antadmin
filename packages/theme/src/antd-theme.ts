// Map design token → cấu hình `theme` cho <a-config-provider> của ant-design-vue.
// Không import ant-design-vue ở đây để theme giữ độc lập (zero runtime dep);
// `AntdThemeConfig` tương thích cấu trúc với prop `theme` của ConfigProvider.
// Phần `algorithm` (light/dark) do layer set vì cần `theme.*Algorithm` từ antdv.

import type { AntAdminTokens } from './tokens'
import { tokensByMode } from './tokens'

export type ThemeMode = 'light' | 'dark'

export interface AntdThemeConfig {
  token?: Record<string, unknown>
  components?: Record<string, Record<string, unknown>>
}

function toAntdToken(t: AntAdminTokens): Record<string, unknown> {
  return {
    colorPrimary: t.color.primary,
    colorSuccess: t.color.success,
    colorWarning: t.color.warning,
    colorError: t.color.error,
    colorInfo: t.color.info,
    colorLink: t.color.link,
    colorLinkHover: t.color.primaryHover,
    colorText: t.color.text,
    colorTextSecondary: t.color.textSecondary,
    colorTextTertiary: t.color.textMuted,
    colorTextQuaternary: t.color.textSubtle,
    colorBorder: t.color.border,
    colorBorderSecondary: t.color.border,
    colorBgBase: t.color.surface,
    colorBgContainer: t.color.surface,
    colorBgElevated: t.color.surfaceElevated,
    colorBgLayout: t.color.page,
    borderRadius: t.radius,
    borderRadiusLG: t.radiusLg,
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    // Height control qua GLOBAL token (antd honor; theme.components thì không).
    controlHeight: t.density.controlHeight,
    controlHeightSM: t.density.controlHeightSM,
    controlHeightLG: t.density.controlHeightLG,
    boxShadowSecondary: t.shadowRaised,
    wireframe: false,
  }
}

// LƯU Ý QUAN TRỌNG: ant-design-vue 4.2.6 KHÔNG honor `theme.components` (override
// token cấp component bị bỏ qua — đã kiểm chứng qua CSS cssinjs thực tế). Vì vậy
// chỉ dùng token TOÀN CỤC ở đây; những tinh chỉnh cấp component (header bảng nền
// primary, hàng chọn, menu active...) được xử lý bằng global CSS trong base.css
// — cách này bền vững giữa các phiên bản (giống dự án OneAuto).

export function getAntdTheme(mode: ThemeMode = 'light'): AntdThemeConfig {
  const t = tokensByMode[mode]
  return { token: toAntdToken(t) }
}

export const antdThemeLight: AntdThemeConfig = getAntdTheme('light')
export const antdThemeDark: AntdThemeConfig = getAntdTheme('dark')
