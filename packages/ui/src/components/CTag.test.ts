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
})
