import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

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

import CInputPercent from './CInputPercent.vue'

function lastEmit(w: ReturnType<typeof mount>, name: string) {
  const calls = w.emitted(name)
  return calls?.[calls.length - 1]?.[0]
}

describe('CInputPercent', () => {
  it('chỉ giữ số và dấu chấm khi gõ', async () => {
    const w = mount(CInputPercent)
    await w.find('input').setValue('12a.3b')
    expect(lastEmit(w, 'update:value')).toBe('12.3')
  })

  it('giới hạn số thập phân theo precision (mặc định 2)', async () => {
    const w = mount(CInputPercent)
    await w.find('input').setValue('12.9999')
    expect(lastEmit(w, 'update:value')).toBe('12.99')
  })

  it('precision tùy biến', async () => {
    const w = mount(CInputPercent, { props: { precision: 0 } })
    await w.find('input').setValue('12.9')
    expect(lastEmit(w, 'update:value')).toBe('12.')
  })

  it('blur kẹp về max khi vượt trần', async () => {
    const w = mount(CInputPercent, { props: { value: 150, max: 100 } })
    await w.find('input').trigger('blur')
    expect(lastEmit(w, 'update:value')).toBe('100')
  })

  it('blur kẹp về min khi dưới sàn', async () => {
    const w = mount(CInputPercent, { props: { value: -5, min: 0 } })
    await w.find('input').trigger('blur')
    expect(lastEmit(w, 'update:value')).toBe('0')
  })

  it('blur với giá trị rỗng chỉ phát blur, không emit update', async () => {
    const w = mount(CInputPercent, { props: { value: '' } })
    await w.find('input').trigger('blur')
    expect(w.emitted('update:value')).toBeUndefined()
    expect(w.emitted('blur')).toHaveLength(1)
  })
})
