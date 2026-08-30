/* eslint-disable vue/one-component-per-file -- nhiều stub antd trong 1 file test */
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Stub antd Input (native input) + Button (native button, forward click) để test
// logic emit mà không kéo render antd nặng. CButton.vue thật dùng Button stub này.
vi.mock('ant-design-vue', () => ({
  Input: defineComponent({
    name: 'AInput',
    props: { value: { type: String, default: '' } },
    emits: ['change', 'pressEnter'],
    setup: (props, { emit, attrs }) => () =>
      h('input', {
        ...attrs,
        value: props.value,
        onChange: (e: Event) => emit('change', e),
        onKeyup: (e: KeyboardEvent) => e.key === 'Enter' && emit('pressEnter', e),
      }),
  }),
  Button: defineComponent({
    name: 'AButton',
    setup: (_p, { slots, attrs }) => () => h('button', { ...attrs }, slots.default?.()),
  }),
}))

import CFilterBar from './CFilterBar.vue'

describe('CFilterBar', () => {
  it('gõ ô tìm kiếm → emit update:searchValue', async () => {
    const w = mount(CFilterBar)
    await w.find('input').setValue('abc')
    expect(w.emitted('update:searchValue')?.at(-1)).toEqual(['abc'])
  })

  it('bấm "Lọc" → emit search kèm searchValue hiện tại', async () => {
    const w = mount(CFilterBar, { props: { searchValue: 'đơn hàng' } })
    const loc = w.findAll('button').find((b) => b.text() === 'Lọc')!
    await loc.trigger('click')
    expect(w.emitted('search')?.at(-1)).toEqual(['đơn hàng'])
  })

  it('Enter trong ô tìm kiếm → emit search', async () => {
    const w = mount(CFilterBar, { props: { searchValue: 'x' } })
    await w.find('input').trigger('keyup', { key: 'Enter' })
    expect(w.emitted('search')?.at(-1)).toEqual(['x'])
  })

  it('bấm "Xoá lọc" → emit reset + xoá searchValue', async () => {
    const w = mount(CFilterBar, { props: { searchValue: 'x' } })
    const reset = w.findAll('button').find((b) => b.text() === 'Xoá lọc')!
    await reset.trigger('click')
    expect(w.emitted('reset')).toHaveLength(1)
    expect(w.emitted('update:searchValue')?.at(-1)).toEqual([''])
  })

  it('showSearch=false ẩn ô tìm kiếm; showReset=false ẩn nút xoá', () => {
    const w = mount(CFilterBar, { props: { showSearch: false, showReset: false } })
    expect(w.find('input').exists()).toBe(false)
    expect(w.findAll('button').map((b) => b.text())).toEqual(['Lọc'])
  })

  it('render slot filters mặc định', () => {
    const w = mount(CFilterBar, { slots: { default: '<span class="my-filter">Trạng thái</span>' } })
    expect(w.find('.my-filter').exists()).toBe(true)
  })
})
