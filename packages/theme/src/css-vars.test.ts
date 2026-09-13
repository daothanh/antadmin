import { describe, expect, it } from 'vitest'
import type { ThemeMode } from './antd-theme'
import { contrastRatioOf } from './contrast'
import { cssVars } from './css-vars'

// Khoá tương phản WCAG AA của các cặp chữ/nền mà component đang dùng (và bảng cặp AA công bố ở docs/guide/theming.md),
// đo trên đúng CSS var phát ra (`cssVars`) của cả hai theme — đổi token làm tụt dưới ngưỡng thì test đỏ thay vì phải đo
// tay như các đợt sửa tương phản trước.

/** Ngưỡng WCAG 2.x AA cho chữ cỡ thường. */
const AA_TEXT = 4.5
const MODES: ThemeMode[] = ['light', 'dark']
const HEX_RE = /#[\da-f]{3,8}\b/gi

interface ContrastPair {
  /** Màu chữ: tên CSS var bỏ tiền tố `--antadmin-` (vd `color-primary`) hoặc hex cố định (`#fff`). */
  fg: string
  /** Màu nền, ghi như `fg`; gradient thì xét mọi điểm màu. */
  bg: string
  /** Nơi dùng — đổi token là biết component nào bị ảnh hưởng. */
  usedBy: string
  /** Chỉ kiểm tra ở các theme này; bỏ trống = cả hai. */
  modes?: ThemeMode[]
  /**
   * Theme đang biết là CHƯA đạt ngưỡng → lý do. Test khẳng định cặp vẫn dưới ngưỡng, nên khi sửa đạt rồi test sẽ đỏ
   * nhắc xoá mục này để cặp được khoá như các cặp khác.
   */
  knownFailures?: Partial<Record<ThemeMode, string>>
}

const SUBTLE_TEXT = 'text-subtle là màu placeholder/disabled của antdv (colorTextQuaternary)'
const THEMING_DOCS = 'bảng cặp AA ở docs/guide/theming.md'

const CONTRAST_PAIRS: ContrastPair[] = [
  // Primary & link
  { fg: 'color-primary', bg: 'color-primary-soft', usedBy: 'CTag primary, CButton ghost, icon CStatistic' },
  { fg: 'color-primary-hover', bg: 'color-primary-soft', usedBy: 'CButton ghost :hover, ::selection theme tối' },
  {
    fg: 'color-primary',
    bg: 'color-surface',
    usedBy: 'CButton secondary/outline/link, mục đang chọn của CTopNav, Pagination, Tabs',
  },
  { fg: 'color-primary-hover', bg: 'color-surface', usedBy: 'CButton secondary/outline/link :hover' },
  { fg: 'color-primary', bg: 'color-surface-elevated', usedBy: 'CButton trong modal/drawer/popover' },
  { fg: 'color-link', bg: 'color-surface', usedBy: 'CTable "Xoá tất cả" trên thanh lọc' },
  { fg: 'color-link', bg: 'color-surface-elevated', usedBy: 'thẻ <a> trong modal/drawer/popover' },
  { fg: 'color-link', bg: 'color-surface-muted', usedBy: 'thẻ <a> trong hàng sọc CTable' },
  { fg: 'color-link', bg: 'color-page', usedBy: 'thẻ <a> trên nền trang' },

  // Chữ trên nền đậm. Theme tối primary/error là màu chữ (sáng), nên base.css đặt chữ trắng lên primary-active /
  // gradient-danger thay cho primary / error.
  {
    fg: '#fff',
    bg: 'color-primary',
    usedBy: 'header bảng, CCard primary, nút primary antdv, ngày đang chọn DatePicker',
    modes: ['light'],
  },
  {
    fg: '#fff',
    bg: 'color-primary-active',
    usedBy: 'CChatMessage, cột sort header bảng; theme tối: header bảng, CCard primary, nút antdv, DatePicker',
  },
  { fg: '#fff', bg: 'gradient-primary', usedBy: 'CButton primary, tab đang chọn của drawer Thiết lập CTable' },
  {
    fg: '#fff',
    bg: 'gradient-danger',
    usedBy: 'CButton danger, nút primary danger antdv, hover item danger Dropdown theme tối',
  },
  { fg: '#fff', bg: 'color-error', usedBy: 'Badge, hover item danger Dropdown antdv', modes: ['light'] },
  { fg: 'color-sidebar-bottom', bg: 'color-accent', usedBy: 'CSideNav mục :hover/đang chọn' },

  // Chữ chính
  {
    fg: 'color-text',
    bg: 'color-surface',
    usedBy: 'mục chưa chọn của CTopNav, tiêu đề CCard, giá trị CStatistic, nút icon CTable',
  },

  // Chữ phụ
  { fg: 'color-text-muted', bg: 'color-surface-muted', usedBy: 'CTag default' },
  { fg: 'color-text-muted', bg: 'color-surface', usedBy: 'nhãn CStatistic, nhãn thanh lọc CTable, footer CAppLayout' },
  { fg: 'color-text-muted', bg: 'color-surface-elevated', usedBy: 'gợi ý trong drawer Thiết lập CTable' },
  {
    fg: 'color-text-subtle',
    bg: 'color-surface',
    usedBy: 'mô tả CEmpty',
    knownFailures: { light: SUBTLE_TEXT, dark: SUBTLE_TEXT },
  },

  // Semantic: accent/success/warning làm chữ thì dùng biến *-text; primary/error/info dùng màu gốc.
  { fg: 'color-accent-text', bg: 'color-accent-soft', usedBy: 'CTag accent, icon CStatistic' },
  { fg: 'color-success-text', bg: 'color-success-soft', usedBy: 'CTag success, icon CStatistic' },
  { fg: 'color-warning-text', bg: 'color-warning-soft', usedBy: 'CTag warning, icon CStatistic' },
  { fg: 'color-error', bg: 'color-error-soft', usedBy: 'CTag error, icon CStatistic' },
  { fg: 'color-info', bg: 'color-info-soft', usedBy: 'CTag info, icon CStatistic' },
  { fg: 'color-accent-text', bg: 'color-surface', usedBy: THEMING_DOCS },
  { fg: 'color-success-text', bg: 'color-surface', usedBy: 'chữ CStatus hoạt động, trend tăng CStatistic' },
  { fg: 'color-warning-text', bg: 'color-surface', usedBy: THEMING_DOCS },
  { fg: 'color-error', bg: 'color-surface', usedBy: 'chữ CStatus không hoạt động, trend giảm CStatistic' },
  { fg: 'color-info', bg: 'color-surface', usedBy: THEMING_DOCS },
  { fg: 'color-error', bg: 'color-surface-elevated', usedBy: 'item danger của Dropdown trong menu thao tác' },
  { fg: 'color-success-text', bg: 'color-info-soft', usedBy: 'chữ CStatus trong hàng đang chọn của bảng' },
  { fg: 'color-error', bg: 'color-info-soft', usedBy: 'chữ CStatus trong hàng đang chọn của bảng' },
]

/** Màu hex của một tham chiếu: `#…` giữ nguyên; tên CSS var → giá trị trong `vars` (gradient → mọi điểm màu). */
function colorsOf(vars: Record<string, string>, ref: string): string[] {
  if (ref.startsWith('#')) return [ref]
  const colors = vars[`--antadmin-${ref}`]?.match(HEX_RE)
  if (!colors) throw new Error(`--antadmin-${ref} không có trong cssVars hoặc không chứa màu hex`)
  return colors
}

/** Tương phản thấp nhất giữa màu chữ và mọi điểm màu của nền. */
function minContrastOf(vars: Record<string, string>, pair: ContrastPair): number {
  const backgrounds = colorsOf(vars, pair.bg)
  return Math.min(
    ...colorsOf(vars, pair.fg).flatMap((fg) => backgrounds.map((bg) => contrastRatioOf(fg, bg))),
  )
}

for (const mode of MODES) {
  describe(`cssVars('${mode}') — tương phản chữ/nền`, () => {
    const vars = cssVars(mode)

    for (const pair of CONTRAST_PAIRS) {
      if (pair.modes && !pair.modes.includes(mode)) continue
      const name = `${pair.fg} trên ${pair.bg} (${pair.usedBy})`
      const knownFailure = pair.knownFailures?.[mode]

      if (knownFailure) {
        it(`${name} → vẫn dưới ${AA_TEXT}:1, ngoại lệ đã biết: ${knownFailure}`, () => {
          expect(
            minContrastOf(vars, pair),
            `đã đạt ${AA_TEXT}:1 — xoá knownFailures.${mode} của cặp ${pair.fg} / ${pair.bg} để khoá ngưỡng`,
          ).toBeLessThan(AA_TEXT)
        })
      } else {
        it(`${name} → ≥ ${AA_TEXT}:1`, () => {
          expect(minContrastOf(vars, pair), `${name} ở theme ${mode}`).toBeGreaterThanOrEqual(AA_TEXT)
        })
      }
    }
  })
}
