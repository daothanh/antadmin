import { describe, expect, it } from 'vitest'
import { contrastRatioOf, luminanceOf } from './contrast'

describe('luminanceOf', () => {
  it('đen → 0, trắng → 1', () => {
    expect(luminanceOf('#000000')).toBe(0)
    expect(luminanceOf('#ffffff')).toBe(1)
  })

  it('kênh thuần đỏ / lục / lam → trọng số 0.2126 / 0.7152 / 0.0722', () => {
    expect(luminanceOf('#ff0000')).toBeCloseTo(0.2126, 10)
    expect(luminanceOf('#00ff00')).toBeCloseTo(0.7152, 10)
    expect(luminanceOf('#0000ff')).toBeCloseTo(0.0722, 10)
  })

  it('kênh rất tối (≤ 10/255) → đoạn tuyến tính c / 12.92, sáng hơn → đường cong gamma', () => {
    expect(luminanceOf('#0a0a0a')).toBeCloseTo(10 / 255 / 12.92, 12)
    expect(luminanceOf('#0b0b0b')).toBeCloseTo(((11 / 255 + 0.055) / 1.055) ** 2.4, 12)
  })

  it('hex 3 chữ số hoặc chữ hoa → như dạng #rrggbb chữ thường', () => {
    expect(luminanceOf('#abc')).toBe(luminanceOf('#aabbcc'))
    expect(luminanceOf('#EEF3FB')).toBe(luminanceOf('#eef3fb'))
  })

  it('không phải hex #rgb / #rrggbb → ném lỗi [@antadmin/theme]', () => {
    for (const color of ['', 'white', 'ffffff', '#ffff', '#ffffff80', '#ggg', 'rgb(0, 0, 0)']) {
      expect(() => luminanceOf(color)).toThrow('[@antadmin/theme]')
    }
  })
})

describe('contrastRatioOf', () => {
  it('#000 / #fff → 21, trùng màu → 1', () => {
    expect(contrastRatioOf('#000', '#fff')).toBe(21)
    expect(contrastRatioOf('#203368', '#203368')).toBe(1)
  })

  it('đổi chỗ chữ và nền → cùng tỉ lệ', () => {
    expect(contrastRatioOf('#fff', '#1068d6')).toBe(contrastRatioOf('#1068d6', '#fff'))
  })

  it('xám mốc trên nền trắng → #767676 đạt 4.54, #777777 chỉ 4.48 (không làm tròn lên 4.5)', () => {
    expect(contrastRatioOf('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
    expect(contrastRatioOf('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
    expect(contrastRatioOf('#777777', '#ffffff')).toBeLessThan(4.5)
  })

  it('số đo của đợt sửa token link sáng và primary tối → khớp changeset', () => {
    expect(contrastRatioOf('#1576f4', '#ffffff')).toBeCloseTo(4.26, 2)
    expect(contrastRatioOf('#1068d6', '#ffffff')).toBeCloseTo(5.29, 2)
    expect(contrastRatioOf('#4f76d1', '#1a2740')).toBeCloseTo(3.44, 2)
    expect(contrastRatioOf('#7090dc', '#1a2740')).toBeCloseTo(4.77, 2)
  })
})
