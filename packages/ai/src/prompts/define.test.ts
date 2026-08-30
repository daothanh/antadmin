import { describe, expect, it } from 'vitest'
import { definePrompt, listPlaceholders, renderPrompt } from './define'
import { promptLibrary } from './library'

const greet = definePrompt({
  id: 'greet',
  version: 1,
  description: 'test',
  template: 'Xin chào {{name}}, bạn ở {{city}}.',
  variables: ['name', 'city'],
})

describe('listPlaceholders', () => {
  it('liệt kê không trùng lặp', () => {
    expect(listPlaceholders('{{a}} {{ b }} {{a}}')).toEqual(['a', 'b'])
  })
})

describe('renderPrompt', () => {
  it('thay biến đúng chỗ', () => {
    expect(renderPrompt(greet, { name: 'An', city: 'Hà Nội' }))
      .toBe('Xin chào An, bạn ở Hà Nội.')
  })

  it('thiếu biến khai báo → ném lỗi kể tên biến', () => {
    // @ts-expect-error cố tình thiếu city
    expect(() => renderPrompt(greet, { name: 'An' })).toThrow(/thiếu biến: city/)
  })

  it('placeholder không được cấp giá trị (typo ngoài variables) → ném lỗi', () => {
    const typo = definePrompt({
      id: 'typo',
      version: 1,
      description: 'test',
      template: 'Hello {{naem}}',
    })
    expect(() => renderPrompt(typo)).toThrow(/naem/)
  })

  it('prompt không biến render được với vars rỗng', () => {
    const plain = definePrompt({ id: 'plain', version: 1, description: 't', template: 'OK' })
    expect(renderPrompt(plain)).toBe('OK')
  })
})

describe('promptLibrary', () => {
  it('id duy nhất và template render được với biến khai báo', () => {
    const ids = promptLibrary.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const p of promptLibrary) {
      // Placeholder trong template phải khớp đúng tập variables khai báo.
      expect(listPlaceholders(p.template).sort()).toEqual([...(p.variables ?? [])].sort())
      const vars = Object.fromEntries((p.variables ?? []).map((v) => [v, 'x']))
      expect(renderPrompt(p as never, vars)).toContain('x')
    }
  })
})
