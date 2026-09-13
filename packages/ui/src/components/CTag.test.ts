import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CTag from './CTag.vue'

describe('CTag', () => {
  it('mặc định color=default → class c-tag--default', () => {
    const w = mount(CTag, { slots: { default: 'Nhãn' } })
    expect(w.classes()).toContain('c-tag')
    expect(w.classes()).toContain('c-tag--default')
    expect(w.text()).toBe('Nhãn')
  })

  it('áp class theo color semantic', () => {
    const w = mount(CTag, { props: { color: 'success' } })
    expect(w.classes()).toContain('c-tag--success')
  })

  it('không render chấm khi dot=false, render khi dot=true', () => {
    const noDot = mount(CTag)
    expect(noDot.find('.c-tag__dot').exists()).toBe(false)
    const withDot = mount(CTag, { props: { dot: true } })
    expect(withDot.find('.c-tag__dot').exists()).toBe(true)
  })

  it('closable → nút ✕ có aria-label (mặc định "Xoá"), bấm → emit close; không closable thì không có nút', async () => {
    expect(mount(CTag).find('button').exists()).toBe(false)
    expect(mount(CTag, { props: { closable: true } }).find('button').attributes('aria-label')).toBe('Xoá')

    const w = mount(CTag, {
      props: { closable: true, closeText: 'Bỏ lọc Trạng thái' },
      slots: { default: 'Trạng thái' },
    })
    const button = w.find('button.c-tag__close')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('Bỏ lọc Trạng thái')
    await button.trigger('click')
    expect(w.emitted('close')).toHaveLength(1)
  })
})
