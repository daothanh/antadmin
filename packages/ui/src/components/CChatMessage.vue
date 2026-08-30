<script setup lang="ts">
// Bong bóng hiển thị một message trong hội thoại AI (user phải / assistant trái).
// Thuần trình bày: nhận role + content, không giữ state — CChat điều phối.
defineOptions({ name: 'CChatMessage' })

withDefaults(defineProps<{
  /** Vai trò message — quyết định căn lề và màu bong bóng. */
  role: 'system' | 'user' | 'assistant'
  content: string
  /** Đang chờ token đầu tiên (content rỗng) → hiện chấm gõ nhấp nháy. */
  pending?: boolean
}>(), {
  pending: false,
})
</script>

<template>
  <div
    class="c-chat-msg"
    :class="`c-chat-msg--${role}`"
  >
    <div class="c-chat-msg__bubble">
      <span
        v-if="pending && !content"
        class="c-chat-msg__dots"
        aria-label="Đang soạn"
      >
        <span /><span /><span />
      </span>
      <template v-else>
        {{ content }}
      </template>
    </div>
  </div>
</template>

<style scoped>
.c-chat-msg {
  display: flex;
  width: 100%;
}
.c-chat-msg--user {
  justify-content: flex-end;
}
.c-chat-msg--assistant,
.c-chat-msg--system {
  justify-content: flex-start;
}
.c-chat-msg__bubble {
  max-width: 76%;
  padding: 9px 13px;
  border-radius: var(--antadmin-radius-lg);
  font-size: var(--antadmin-font-size);
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.c-chat-msg--user .c-chat-msg__bubble {
  background: var(--antadmin-color-primary);
  color: #fff;
  border-bottom-right-radius: var(--antadmin-radius);
}
.c-chat-msg--assistant .c-chat-msg__bubble {
  background: var(--antadmin-color-surface-muted);
  color: var(--antadmin-color-text);
  border: 1px solid var(--antadmin-color-border);
  border-bottom-left-radius: var(--antadmin-radius);
}
.c-chat-msg--system .c-chat-msg__bubble {
  background: transparent;
  color: var(--antadmin-color-text-muted);
  font-size: 13px;
  font-style: italic;
}

/* Chấm gõ — thuần CSS, không kéo thêm lib icon. */
.c-chat-msg__dots {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 0;
}
.c-chat-msg__dots span {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--antadmin-color-text-muted);
  animation: c-chat-blink 1.4s infinite both;
}
.c-chat-msg__dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.c-chat-msg__dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes c-chat-blink {
  0%, 80%, 100% {
    opacity: 0.25;
  }
  40% {
    opacity: 1;
  }
}
</style>
