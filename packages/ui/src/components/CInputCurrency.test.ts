import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Stub antd Input về <input> thật để trigger được sự kiện input/blur.
vi.mock('ant-design-vue', () => ({
  Input: defineComponent({
    name: 'AInput',
    props: { value: { type: [String, Number], default: '' } },
    emits: ['input', 'blur'],
    setup: (props, { emit, attrs }) => () =>
      h('input', {
        ...attrs,
        value: props.value,
        onInput: (e: Event) => emit('input', e),
        onBlur: (e: FocusEvent) => emit('blur', e),
      }),
  }),
}))

import CInputCurrency from './CInputCurrency.vue'

function lastEmit(w: ReturnType<typeof mount>, name: string) {
  const calls = w.emitted(name)
  return calls?.[calls.length - 1]?.[0]
}

describe('CInputCurrency', () => {
  it('hiển thị ban đầu định dạng nghìn từ prop value', () => {
    const w = mount(CInputCurrency, { props: { value: 1234567 } })
    expect(w.find('input').element.value).toBe('1.234.567')
  })

  it('gõ số → format nghìn và emit số thuần', async () => {
    const w = mount(CInputCurrency)
    const input = w.find('input')
    await input.setValue('1234567')
    expect(input.element.value).toBe('1.234.567')
    expect(lastEmit(w, 'update:value')).toBe(1234567)
  })

  it('hỗ trợ phần thập phân bằng dấu phẩy', async () => {
    const w = mount(CInputCurrency)
    const input = w.find('input')
    await input.setValue('1234,5')
    expect(input.element.value).toBe('1.234,5')
    expect(lastEmit(w, 'update:value')).toBe(1234.5)
  })

  it('loại ký tự chữ, chỉ giữ số và dấu phẩy', async () => {
    const w = mount(CInputCurrency)
    const input = w.find('input')
    await input.setValue('a1b0c0d0')
    expect(input.element.value).toBe('1.000')
    expect(lastEmit(w, 'update:value')).toBe(1000)
  })

  it('rỗng → emit null', async () => {
    const w = mount(CInputCurrency)
    const input = w.find('input')
    await input.setValue('abc')
    expect(lastEmit(w, 'update:value')).toBeNull()
  })

  it('blur phát sự kiện blur', async () => {
    const w = mount(CInputCurrency, { props: { value: 1000 } })
    await w.find('input').trigger('blur')
    expect(w.emitted('blur')).toHaveLength(1)
  })
})
