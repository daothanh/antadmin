import { describe, expect, it } from 'vitest'
import { formatComponentDetail, formatComponentSummary, formatPackages } from './format'
import type { ComponentMeta } from './types'

const C: ComponentMeta = {
  name: 'CChat',
  description: 'Panel chat AI',
  path: 'packages/ui/src/components/CChat.vue',
  props: [
    { name: 'messages', type: 'ChatMessage[]', optional: false },
    { name: 'status', type: "'idle' | 'streaming'", optional: true, default: "'idle'", description: 'Vòng đời.' },
  ],
  emits: ['send', 'stop'],
}

describe('formatComponentSummary', () => {
  it('gồm tên, số props, mô tả', () => {
    expect(formatComponentSummary(C)).toBe('CChat (2 props) — Panel chat AI')
  })
})

describe('formatComponentDetail', () => {
  it('render props có optional/default/doc + emits', () => {
    const out = formatComponentDetail(C)
    expect(out).toContain('# CChat')
    expect(out).toContain('- messages: ChatMessage[]')
    expect(out).toContain("- status?: 'idle' | 'streaming' = 'idle'  // Vòng đời.")
    expect(out).toContain('## Emits')
    expect(out).toContain('- send')
  })

  it('component không props/emits', () => {
    const out = formatComponentDetail({ name: 'CX', description: '', path: 'x', props: [], emits: [] })
    expect(out).toContain('(không có props)')
    expect(out).not.toContain('## Emits')
  })
})

describe('formatPackages', () => {
  it('bảng name@version — desc', () => {
    expect(formatPackages([{ name: '@antadmin/ui', version: '1.3.0', description: 'UI kit' }]))
      .toBe('@antadmin/ui@1.3.0 — UI kit')
  })
  it('rỗng', () => {
    expect(formatPackages([])).toBe('Không có package.')
  })
})
