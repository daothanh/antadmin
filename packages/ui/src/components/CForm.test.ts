import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Stub Form render mọi slot nhận được (kèm slotProps) để test forward slot động.
vi.mock('ant-design-vue', () => ({
  Form: defineComponent({
    name: 'AForm',
    setup: (_props, { slots, attrs }) => () =>
      h(
        'form',
        { ...attrs },
        Object.entries(slots).map(([name, slot]) =>
          h('div', { 'data-slot': name }, slot?.({ msg: 'từ antd' })),
        ),
      ),
  }),
}))

import CForm from './CForm.vue'

describe('CForm', () => {
  it('mặc định layout vertical, override được qua attrs', () => {
    expect(mount(CForm).find('form').attributes('layout')).toBe('vertical')
    expect(
      mount(CForm, { attrs: { layout: 'horizontal' } }).find('form').attributes('layout'),
    ).toBe('horizontal')
  })

  it('forward slot default + slot tên bất kỳ xuống Form', () => {
    const w = mount(CForm, {
      slots: { default: '<span>nội dung</span>', extra: '<em>phần phụ</em>' },
    })
    expect(w.find('[data-slot=default]').text()).toBe('nội dung')
    expect(w.find('[data-slot=extra]').text()).toBe('phần phụ')
  })

  it('truyền slotProps từ Form về slot của cha', () => {
    const w = mount(CForm, {
      slots: { default: (props: { msg: string }) => h('i', props.msg) },
    })
    expect(w.find('[data-slot=default] i').text()).toBe('từ antd')
  })
})
