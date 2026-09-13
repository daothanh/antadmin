// Tỉ lệ tương phản màu theo WCAG 2.x (relative luminance) — hàm thuần, không phụ thuộc DOM.
// Hiện chỉ test dùng (khoá tương phản cặp token trong css-vars.test.ts) nên chưa export ra index.ts: vào barrel là
// thành API public của package, phải giữ theo semver.

const HEX_COLOR_RE = /^#([\da-f]{3}|[\da-f]{6})$/i

/** `#rgb` / `#rrggbb` → [r, g, b] (0–255); chuỗi khác → `null`. */
function parseHexColor(color: string): [number, number, number] | null {
  const hex = HEX_COLOR_RE.exec(color)?.[1]
  if (!hex) return null
  const full = hex.length === 3 ? [...hex].map((digit) => digit + digit).join('') : hex
  const channelAt = (offset: number) => Number.parseInt(full.slice(offset, offset + 2), 16)
  return [channelAt(0), channelAt(2), channelAt(4)]
}

/** Kênh sRGB 0–255 → cường độ sáng tuyến tính 0–1. */
function toLinearChannel(channel: number): number {
  const c = channel / 255
  // Ngưỡng 0.04045 theo chuẩn sRGB; WCAG 2.0 ghi 0.03928 nhưng với kênh 8-bit hai ngưỡng cho cùng kết quả.
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/**
 * Relative luminance theo WCAG 2.x: 0 (đen) → 1 (trắng). Nhận hex `#rgb` / `#rrggbb`, không phân biệt hoa thường;
 * chuỗi khác (tên màu, `rgb()`, hex có alpha) → ném lỗi.
 */
export function luminanceOf(color: string): number {
  const rgb = parseHexColor(color)
  if (!rgb) {
    throw new Error(
      `[@antadmin/theme] Màu "${color}" không hợp lệ — cần hex #rgb/#rrggbb (màu có alpha phải trộn với nền trước).`,
    )
  }
  const [r, g, b] = rgb
  return 0.2126 * toLinearChannel(r) + 0.7152 * toLinearChannel(g) + 0.0722 * toLinearChannel(b)
}

/**
 * Tỉ lệ tương phản WCAG 2.x giữa hai màu: 1 (trùng màu) → 21 (đen/trắng); đổi chỗ chữ và nền cho cùng kết quả.
 * Ngưỡng AA: ≥ 4.5 cho chữ thường, ≥ 3 cho chữ lớn và thành phần đồ hoạ. Kết quả không làm tròn vì WCAG không cho
 * làm tròn lên (4.499 là chưa đạt 4.5).
 */
export function contrastRatioOf(foreground: string, background: string): number {
  const a = luminanceOf(foreground)
  const b = luminanceOf(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
