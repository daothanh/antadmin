<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Alert, Button, Textarea } from 'ant-design-vue'
import CChatMessage from './CChatMessage.vue'

// Panel chat AI hoàn chỉnh (controlled): list message auto-scroll + ô soạn.
// KHÔNG tự gọi API — nhận messages/status/error từ ngoài (thường là useAiChat
// của @antadmin/ai) và emit send/stop/clear. Giữ @antadmin/ui độc lập tầng AI.
defineOptions({ name: 'CChat' })

export type ChatRole = 'system' | 'user' | 'assistant'
export interface ChatMessage {
  role: ChatRole
  content: string
}

const props = withDefaults(defineProps<{
  messages: ChatMessage[]
  /** Vòng đời phiên chat — 'streaming' đổi nút Gửi thành Dừng. */
  status?: 'idle' | 'streaming' | 'error'
  /** Thông báo lỗi hiển thị dạng Alert (thường là error.message). */
  error?: string | null
  title?: string
  placeholder?: string
  /** Văn bản khi hội thoại trống. */
  emptyText?: string
  /** Khoá ô nhập (ví dụ chưa đăng nhập / hết quota). */
  disabled?: boolean
}>(), {
  status: 'idle',
  error: null,
  title: '',
  placeholder: 'Nhập tin nhắn… (Enter để gửi, Shift+Enter xuống dòng)',
  emptyText: 'Bắt đầu cuộc trò chuyện với trợ lý AI.',
  disabled: false,
})

const emit = defineEmits<{
  send: [text: string]
  stop: []
  clear: []
}>()

const draft = ref('')
const listRef = ref<HTMLElement | null>(null)

const isStreaming = computed(() => props.status === 'streaming')
// Chỉ hiện message hội thoại — system prompt (nếu lọt vào) không phô ra UI.
const visibleMessages = computed(() =>
  props.messages.filter((m) => m.role !== 'system'),
)
const canSend = computed(() =>
  !props.disabled && !isStreaming.value && draft.value.trim().length > 0,
)
const indexOfLast = computed(() => props.messages.length - 1)

function submit(): void {
  if (!canSend.value) return
  emit('send', draft.value.trim())
  draft.value = ''
}

function onEnter(e: KeyboardEvent): void {
  // Shift+Enter = xuống dòng; đang gõ IME (telex tiếng Việt) không cắt ngang.
  if (e.shiftKey || e.isComposing) return
  e.preventDefault()
  submit()
}

function scrollToBottom(): void {
  const el = listRef.value
  if (el) el.scrollTop = el.scrollHeight
}

// Bám đáy khi có message mới hoặc token stream cập nhật nội dung.
watch(
  () => props.messages.map((m) => m.content).join(''),
  () => nextTick(scrollToBottom),
  { flush: 'post' },
)
</script>

<template>
  <section class="c-chat">
    <header
      v-if="title || visibleMessages.length"
      class="c-chat__head"
    >
      <span class="c-chat__title">{{ title }}</span>
      <Button
        v-if="visibleMessages.length"
        type="text"
        size="small"
        class="c-chat__clear"
        @click="emit('clear')"
      >
        Xoá hội thoại
      </Button>
    </header>

    <div
      ref="listRef"
      class="c-chat__list"
    >
      <p
        v-if="!visibleMessages.length"
        class="c-chat__empty"
      >
        {{ emptyText }}
      </p>

      <CChatMessage
        v-for="(m, i) in messages"
        v-show="m.role !== 'system'"
        :key="i"
        :role="m.role"
        :content="m.content"
        :pending="isStreaming && i === indexOfLast && m.role === 'assistant'"
      />

      <Alert
        v-if="error"
        class="c-chat__error"
        type="error"
        show-icon
        :message="error"
      />
    </div>

    <div class="c-chat__composer">
      <Textarea
        v-model:value="draft"
        class="c-chat__input"
        :placeholder="placeholder"
        :disabled="disabled"
        :auto-size="{ minRows: 1, maxRows: 6 }"
        @keydown.enter="onEnter"
      />
      <Button
        v-if="isStreaming"
        class="c-chat__stop"
        danger
        @click="emit('stop')"
      >
        Dừng
      </Button>
      <Button
        v-else
        class="c-chat__send"
        type="primary"
        :disabled="!canSend"
        @click="submit"
      >
        Gửi
      </Button>
    </div>
  </section>
</template>

<style scoped>
.c-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--antadmin-color-surface);
  border: 1px solid var(--antadmin-color-border);
  border-radius: var(--antadmin-radius-lg);
  overflow: hidden;
}
.c-chat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--antadmin-color-border);
}
.c-chat__title {
  font-family: var(--antadmin-font-family-heading);
  font-weight: 600;
  color: var(--antadmin-color-text);
}
.c-chat__clear {
  margin-left: auto;
  color: var(--antadmin-color-text-muted);
}
.c-chat__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}
.c-chat__empty {
  margin: auto;
  text-align: center;
  color: var(--antadmin-color-text-muted);
}
.c-chat__error {
  margin-top: 4px;
}
.c-chat__composer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--antadmin-color-border);
  background: var(--antadmin-color-surface);
}
.c-chat__input {
  flex: 1 1 auto;
}
</style>
