// Map design token → CSS variables `--antadmin-*` để dùng trong scoped style của
// @antadmin/ui và style tuỳ biến của app (layout, trang tĩnh...). Đây là cầu nối để
// component không hard-code màu mà luôn bám theme — đổi mode light/dark chỉ cần
// thay tập biến này ở `:root`.

import type { ThemeMode } from './antd-theme'
import { tokensByMode } from './tokens'

export function cssVars(mode: ThemeMode = 'light'): Record<string, string> {
  const t = tokensByMode[mode]
  const c = t.color
  return {
    '--antadmin-color-primary': c.primary,
    '--antadmin-color-primary-hover': c.primaryHover,
    '--antadmin-color-primary-active': c.primaryActive,
    '--antadmin-color-primary-soft': c.primarySoft,
    '--antadmin-color-accent': c.accent,
    '--antadmin-color-accent-soft': c.accentSoft,
    '--antadmin-color-success': c.success,
    '--antadmin-color-success-soft': c.successSoft,
    '--antadmin-color-warning': c.warning,
    '--antadmin-color-warning-soft': c.warningSoft,
    '--antadmin-color-error': c.error,
    '--antadmin-color-error-soft': c.errorSoft,
    '--antadmin-color-info': c.info,
    '--antadmin-color-info-soft': c.infoSoft,
    '--antadmin-color-link': c.link,
    '--antadmin-color-link-soft': c.linkSoft,
    '--antadmin-color-text': c.text,
    '--antadmin-color-text-secondary': c.textSecondary,
    '--antadmin-color-text-muted': c.textMuted,
    '--antadmin-color-text-subtle': c.textSubtle,
    '--antadmin-color-surface': c.surface,
    '--antadmin-color-surface-elevated': c.surfaceElevated,
    '--antadmin-color-surface-muted': c.surfaceMuted,
    '--antadmin-color-page': c.page,
    '--antadmin-color-border': c.border,
    '--antadmin-color-border-strong': c.borderStrong,
    '--antadmin-color-sidebar-top': c.sidebarTop,
    '--antadmin-color-sidebar-bottom': c.sidebarBottom,
    '--antadmin-radius': `${t.radius}px`,
    '--antadmin-radius-lg': `${t.radiusLg}px`,
    // Mật độ component (base.css dùng để override padding/height/margin).
    '--antadmin-control-height-sm': `${t.density.controlHeightSM}px`,
    '--antadmin-control-height-lg': `${t.density.controlHeightLG}px`,
    '--antadmin-card-padding-block': `${t.density.cardPaddingBlock}px`,
    '--antadmin-card-padding-inline': `${t.density.cardPaddingInline}px`,
    '--antadmin-card-heading-height': `${t.density.cardHeadingHeight}px`,
    '--antadmin-card-heading-font-size': `${t.density.cardHeadingFontSize}px`,
    '--antadmin-form-item-margin': `${t.density.formItemMarginBottom}px`,
    '--antadmin-table-cell-padding-block': `${t.density.tableCellPaddingBlock}px`,
    '--antadmin-table-cell-padding-inline': `${t.density.tableCellPaddingInline}px`,
    '--antadmin-modal-body-padding': `${t.density.modalBodyPadding}px`,
    '--antadmin-font-family': t.fontFamily,
    '--antadmin-font-family-heading': t.fontFamilyHeading,
    '--antadmin-font-size': `${t.fontSize}px`,
    '--antadmin-control-height': `${t.controlHeight}px`,
    '--antadmin-spacing-unit': `${t.spacingUnit}px`,
    '--antadmin-gradient-primary': t.gradientPrimary,
    '--antadmin-gradient-danger': t.gradientDanger,
    '--antadmin-shadow-card': t.shadowCard,
    '--antadmin-shadow-raised': t.shadowRaised,
  }
}

/**
 * Sinh chuỗi CSS để inject vào <head> (vd qua `app.head.style` trong layer).
 * @param selector mặc định `:root`.
 */
export function cssVarsText(mode: ThemeMode = 'light', selector = ':root'): string {
  const body = Object.entries(cssVars(mode))
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
  return `${selector} {\n${body}\n}`
}
