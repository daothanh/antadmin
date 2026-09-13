import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Stub primitive antdv — test logic điều phối của CChat, không test lại antdv.
// `class`/`disabled` fallthrough xuống element gốc nên vẫn tìm được bằng selector.
vi.mock('ant-design-vue', () => ({
  Button: defineComponent({
    name: 'AButton',
    emits: ['click'],
    setup: (_p, { slots, emit }) => () =>
      h('button', { onClick: () => emit('click') }, slots.default?.()),
  }),
  Textarea: defineComponent({
    name: 'ATextarea',
    props: { value: { type: String, default: '' } },
    emits: ['update:value'],
    setup: (p, { emit }) => () =>
      h('textarea', {
        value: p.value,
        onInput: (e: Event) => emit('update:value', (e.target as HTMLTextAreaElement).value),
      }),
  }),
  Alert: defineComponent({
    name: 'AAlert',
    props: { message: { type: String, default: '' } },
    setup: (p) => () => h('div', { class: 'stub-alert' }, p.message),
  }),
}))

import CChat from './CChat.vue'

const user = { role: 'user' as const, content: 'chào' }
const assistant = { role: 'assistant' as const, content: 'chào bạn' }

describe('CChat', () => {
  it('render message user + assistant (bỏ qua system)', () => {
    const w = mount(CChat, {
      props: { messages: [{ role: 'system', content: 'ctx' }, user, assistant] },
    })
    expect(w.text()).toContain('chào bạn')
    // system bị v-show ẩn nhưng không tính vào visible → có nút xoá vì có user/assistant.
    expect(w.find('.c-chat__clear').exists()).toBe(true)
  })

  it('hội thoại trống → hiện empty text, ẩn nút xoá', () => {
    const w = mount(CChat, { props: { messages: [], emptyText: 'Trống rỗng' } })
    expect(w.find('.c-chat__empty').text()).toBe('Trống rỗng')
    expect(w.find('.c-chat__clear').exists()).toBe(false)
  })

  it('chỉ có system → coi như trống', () => {
    const w = mount(CChat, { props: { messages: [{ role: 'system', content: 'ctx' }] } })
    expect(w.find('.c-chat__empty').exists()).toBe(true)
    expect(w.find('.c-chat__clear').exists()).toBe(false)
  })

  it('nhập text + Gửi → emit send, xoá ô nhập', async () => {
    const w = mount(CChat, { props: { messages: [] } })
    await w.find('textarea').setValue('  câu hỏi  ')
    expect(w.find('.c-chat__send').attributes('disabled')).toBeUndefined()
    await w.find('.c-chat__send').trigger('click')
    expect(w.emitted('send')?.[0]).toEqual(['câu hỏi'])
    expect((w.find('textarea').element as HTMLTextAreaElement).value).toBe('')
  })

  it('ô nhập rỗng → nút Gửi disabled, không emit', async () => {
    const w = mount(CChat, { props: { messages: [] } })
    expect(w.find('.c-chat__send').attributes('disabled')).toBeDefined()
    await w.find('textarea').setValue('   ')
    expect(w.find('.c-chat__send').attributes('disabled')).toBeDefined()
  })

  it('Enter gửi; Shift+Enter và IME thì không', async () => {
    const w = mount(CChat, { props: { messages: [] } })
    await w.find('textarea').setValue('nội dung')

    await w.find('textarea').trigger('keydown.enter', { shiftKey: true })
    expect(w.emitted('send')).toBeUndefined()

    await w.find('textarea').trigger('keydown.enter', { isComposing: true })
    expect(w.emitted('send')).toBeUndefined()

    await w.find('textarea').trigger('keydown.enter')
    expect(w.emitted('send')?.[0]).toEqual(['nội dung'])
  })

  it('streaming → hiện nút Dừng thay Gửi, click emit stop', async () => {
    const w = mount(CChat, { props: { messages: [user, { role: 'assistant', content: '' }], status: 'streaming' } })
    expect(w.find('.c-chat__send').exists()).toBe(false)
    expect(w.find('.c-chat__stop').exists()).toBe(true)
    await w.find('.c-chat__stop').trigger('click')
    expect(w.emitted('stop')).toHaveLength(1)
  })

  it('streaming chặn gửi qua Enter', async () => {
    const w = mount(CChat, { props: { messages: [], status: 'streaming' } })
    await w.find('textarea').setValue('x')
    await w.find('textarea').trigger('keydown.enter')
    expect(w.emitted('send')).toBeUndefined()
  })

  it('disabled → không gửi được', async () => {
    const w = mount(CChat, { props: { messages: [], disabled: true } })
    await w.find('textarea').setValue('x')
    await w.find('textarea').trigger('keydown.enter')
    expect(w.emitted('send')).toBeUndefined()
  })

  it('nút Xoá hội thoại → emit clear', async () => {
    const w = mount(CChat, { props: { messages: [user] } })
    await w.find('.c-chat__clear').trigger('click')
    expect(w.emitted('clear')).toHaveLength(1)
  })

  it('error → render Alert', () => {
    const w = mount(CChat, { props: { messages: [], error: 'Hỏng rồi' } })
    expect(w.find('.stub-alert').text()).toBe('Hỏng rồi')
  })

  it('pending chỉ gắn cho assistant cuối khi streaming', () => {
    const w = mount(CChat, {
      props: { messages: [user, { role: 'assistant', content: '' }], status: 'streaming' },
    })
    expect(w.findComponent({ name: 'CChatMessage' }).exists()).toBe(true)
    expect(w.find('.c-chat-msg__dots').exists()).toBe(true)
  })
})
