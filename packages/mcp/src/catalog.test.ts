import { describe, expect, it } from 'vitest'
import {
  extractComponentMeta,
  extractDescription,
  matchBalanced,
  parseDefaults,
  parseEmits,
  parseProps,
} from './catalog'

const SFC = `<script setup lang="ts">
import { computed } from 'vue'

// Panel chat AI hoàn chỉnh (controlled).
// Giữ @antadmin/ui độc lập tầng AI.
defineOptions({ name: 'CChat' })

const props = withDefaults(defineProps<{
  messages: ChatMessage[]
  /** Vòng đời phiên chat. */
  status?: 'idle' | 'streaming' | 'error'
  disabled?: boolean
}>(), {
  status: 'idle',
  disabled: false,
})

const emit = defineEmits<{
  send: [text: string]
  stop: []
}>()
</script>

<template><div /></template>
`

describe('matchBalanced', () => {
  it('khớp ngoặc lồng nhau', () => {
    const s = 'f({ a: [1, 2] })'
    expect(matchBalanced(s, 1)).toBe(s.length - 1)
  })
  it('trả -1 khi không đóng', () => {
    expect(matchBalanced('f({', 1)).toBe(-1)
  })
})

describe('parseProps', () => {
  it('tách tên/optional/type + JSDoc', () => {
    const props = parseProps(`
  messages: ChatMessage[]
  /** Vòng đời. */
  status?: 'idle' | 'streaming'
`)
    expect(props).toHaveLength(2)
    expect(props[0]).toMatchObject({ name: 'messages', optional: false, type: 'ChatMessage[]' })
    expect(props[1]).toMatchObject({ name: 'status', optional: true })
    expect(props[1]!.description).toBe('Vòng đời.')
  })
})

describe('parseDefaults', () => {
  it('map name→giá trị thô', () => {
    expect(parseDefaults(`status: 'idle',\ndisabled: false,`)).toEqual({
      status: "'idle'",
      disabled: 'false',
    })
  })
})

describe('parseEmits', () => {
  it('chỉ lấy tên event', () => {
    expect(parseEmits(`send: [text: string]\nstop: []`)).toEqual(['send', 'stop'])
  })
})

describe('extractDescription', () => {
  it('gộp block comment đầu', () => {
    expect(extractDescription(SFC.replace(/<\/?script[^>]*>/g, ''))).toContain('Panel chat AI')
  })
})

describe('extractComponentMeta', () => {
  it('trích đầy đủ từ SFC', () => {
    const meta = extractComponentMeta(SFC, 'packages/ui/src/components/CChat.vue')
    expect(meta).not.toBeNull()
    expect(meta!.name).toBe('CChat')
    expect(meta!.description).toContain('Panel chat AI')
    expect(meta!.props.map((p) => p.name)).toEqual(['messages', 'status', 'disabled'])
    expect(meta!.props.find((p) => p.name === 'status')!.default).toBe("'idle'")
    expect(meta!.emits).toEqual(['send', 'stop'])
    expect(meta!.path).toContain('CChat.vue')
  })

  it('dùng fallbackName khi không có defineOptions', () => {
    const meta = extractComponentMeta('<script setup>\nconst x = 1\n</script>', 'X.vue', 'CFoo')
    expect(meta!.name).toBe('CFoo')
    expect(meta!.props).toEqual([])
    expect(meta!.emits).toEqual([])
  })

  it('trả null khi không suy ra được tên', () => {
    expect(extractComponentMeta('<template><div/></template>', 'x.vue')).toBeNull()
  })
})
