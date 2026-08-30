import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Tooltip của antd chỉ là vỏ bọc — stub để test logic active/label thuần.
vi.mock('ant-design-vue', () => ({
  Tooltip: defineComponent({
    name: 'ATooltip',
    setup: (_p, { slots }) => () => h('span', {}, slots.default?.()),
  }),
}))

import CStatus from './CStatus.vue'

describe('CStatus', () => {
  it('status=1 (mặc định activeValue) → active', () => {
    const w = mount(CStatus, { props: { status: 1 } })
    expect(w.find('.c-status--active').exists()).toBe(true)
  })

  it('status=0 → inactive', () => {
    const w = mount(CStatus, { props: { status: 0 } })
    expect(w.find('.c-status--inactive').exists()).toBe(true)
  })

  it('boolean true luôn active', () => {
    const w = mount(CStatus, { props: { status: true } })
    expect(w.find('.c-status--active').exists()).toBe(true)
  })

  it('activeValue tùy biến', () => {
    const w = mount(CStatus, { props: { status: 'ON', activeValue: 'ON' } })
    expect(w.find('.c-status--active').exists()).toBe(true)
  })

  it('showText hiện nhãn tương ứng trạng thái', () => {
    const active = mount(CStatus, {
      props: { status: 1, showText: true, activeText: 'Chạy' },
    })
    expect(active.text()).toContain('Chạy')
    const inactive = mount(CStatus, {
      props: { status: 0, showText: true, inactiveText: 'Dừng' },
    })
    expect(inactive.text()).toContain('Dừng')
  })
})
