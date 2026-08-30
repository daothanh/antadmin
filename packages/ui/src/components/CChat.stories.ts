import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import CChat from './CChat.vue'
import type { ChatMessage } from './CChat.vue'

const meta: Meta<typeof CChat> = {
  title: 'Components/CChat',
  component: CChat,
}
export default meta

type Story = StoryObj<typeof CChat>

// Hội thoại có sẵn — trạng thái tĩnh.
export const Conversation: Story = {
  render: () => ({
    components: { CChat },
    setup() {
      const messages = ref<ChatMessage[]>([
        { role: 'user', content: 'Tóm tắt tình hình thu phí tháng này giúp tôi.' },
        { role: 'assistant', content: 'Tổng thu phí đạt 128 tỷ, hoàn thành 94% kế hoạch tháng. Trạm QL5 dẫn đầu.' },
      ])
      return { messages }
    },
    template: `<div style="height:420px;max-width:520px"><CChat title="Trợ lý AntAdmin" :messages="messages" /></div>`,
  }),
}

// Demo tương tác: giả lập assistant trả lời (không gọi API thật).
export const Interactive: Story = {
  render: () => ({
    components: { CChat },
    setup() {
      const messages = ref<ChatMessage[]>([])
      const status = ref<'idle' | 'streaming' | 'error'>('idle')
      function onSend(text: string) {
        messages.value.push({ role: 'user', content: text })
        messages.value.push({ role: 'assistant', content: '' })
        status.value = 'streaming'
        const reply = `Bạn vừa hỏi: “${text}”. Đây là câu trả lời giả lập để demo streaming.`
        let i = 0
        const last = messages.value[messages.value.length - 1]!
        const timer = setInterval(() => {
          last.content += reply[i] ?? ''
          if (++i >= reply.length) {
            clearInterval(timer)
            status.value = 'idle'
          }
        }, 24)
      }
      return { messages, status, onSend }
    },
    template: `
      <div style="height:420px;max-width:520px">
        <CChat
          title="Trợ lý AntAdmin"
          :messages="messages"
          :status="status"
          @send="onSend"
          @clear="messages = []"
        />
      </div>
    `,
  }),
}

export const Empty: Story = {
  render: () => ({
    components: { CChat },
    setup: () => ({ messages: ref<ChatMessage[]>([]) }),
    template: `<div style="height:360px;max-width:520px"><CChat :messages="messages" /></div>`,
  }),
}
