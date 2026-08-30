import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CChatMessage from './CChatMessage.vue'

describe('CChatMessage', () => {
  it('role → class căn lề tương ứng', () => {
    expect(mount(CChatMessage, { props: { role: 'user', content: 'hi' } })
      .find('.c-chat-msg--user').exists()).toBe(true)
    expect(mount(CChatMessage, { props: { role: 'assistant', content: 'hi' } })
      .find('.c-chat-msg--assistant').exists()).toBe(true)
    expect(mount(CChatMessage, { props: { role: 'system', content: 'hi' } })
      .find('.c-chat-msg--system').exists()).toBe(true)
  })

  it('render nội dung message', () => {
    const w = mount(CChatMessage, { props: { role: 'assistant', content: 'Xin chào' } })
    expect(w.text()).toContain('Xin chào')
  })

  it('pending + content rỗng → hiện chấm gõ', () => {
    const w = mount(CChatMessage, { props: { role: 'assistant', content: '', pending: true } })
    expect(w.find('.c-chat-msg__dots').exists()).toBe(true)
  })

  it('pending nhưng đã có content → không hiện chấm gõ', () => {
    const w = mount(CChatMessage, { props: { role: 'assistant', content: 'đã có', pending: true } })
    expect(w.find('.c-chat-msg__dots').exists()).toBe(false)
    expect(w.text()).toContain('đã có')
  })

  it('mặc định pending=false', () => {
    const w = mount(CChatMessage, { props: { role: 'assistant', content: '' } })
    expect(w.find('.c-chat-msg__dots').exists()).toBe(false)
  })
})
