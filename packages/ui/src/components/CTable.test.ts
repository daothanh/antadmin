/* eslint-disable vue/one-component-per-file -- stub antd trong 1 file test */
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Stub Table render mọi slot nhận được (kèm slotProps) để test forward slot động.
vi.mock('ant-design-vue', () => ({
  Table: defineComponent({
    name: 'ATable',
    setup: (_props, { slots, attrs }) => () =>
      h(
        'table',
        { ...attrs },
        Object.entries(slots).map(([name, slot]) =>
          h('caption', { 'data-slot': name }, slot?.({ column: { key: 'ten' } })),
        ),
      ),
  }),
}))

import CTable from './CTable.vue'

describe('CTable', () => {
  it('mặc định size middle, override được qua attrs', () => {
    expect(mount(CTable).find('table').attributes('size')).toBe('middle')
    expect(
      mount(CTable, { attrs: { size: 'small' } }).find('table').attributes('size'),
    ).toBe('small')
  })

  it('forward slot tên bất kỳ (bodyCell…) xuống Table', () => {
    const w = mount(CTable, {
      slots: { bodyCell: '<span>ô dữ liệu</span>', title: '<b>tiêu đề</b>' },
    })
    expect(w.find('[data-slot=bodyCell]').text()).toBe('ô dữ liệu')
    expect(w.find('[data-slot=title]').text()).toBe('tiêu đề')
  })

  it('truyền slotProps từ Table về slot của cha', () => {
    const w = mount(CTable, {
      slots: {
        bodyCell: (props: { column: { key: string } }) => h('i', props.column.key),
      },
    })
    expect(w.find('[data-slot=bodyCell] i').text()).toBe('ten')
  })
})
