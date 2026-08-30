import { describe, expect, it, vi } from 'vitest'
import { formatReport, summarize } from './report'
import { callGateway, runEvalCase, runEvalSuite, type EvalRunOptions } from './runner'

function gatewayMock(content: string, status = 200) {
  return vi.fn(async () =>
    new Response(
      JSON.stringify({ choices: [{ message: { content } }] }),
      { status, headers: { 'content-type': 'application/json' } },
    ),
  ) as unknown as typeof globalThis.fetch
}

const baseOptions = (fetch: typeof globalThis.fetch): EvalRunOptions => ({
  gatewayUrl: 'https://gw.test/v1/',
  apiKey: 'k',
  model: 'm',
  fetch,
})

describe('callGateway', () => {
  it('POST đúng endpoint (bỏ trailing slash), Bearer key, non-stream, temp 0', async () => {
    const fetch = gatewayMock('chào')
    const out = await callGateway([{ role: 'user', content: 'hi' }], baseOptions(fetch))
    expect(out).toBe('chào')
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(url).toBe('https://gw.test/v1/chat/completions')
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer k')
    const body = JSON.parse(init.body as string)
    expect(body.stream).toBe(false)
    expect(body.temperature).toBe(0)
  })

  it('HTTP lỗi → ném kèm status', async () => {
    await expect(callGateway([], baseOptions(gatewayMock('', 500))))
      .rejects.toThrow(/500/)
  })

  it('shape thiếu content → ném lỗi', async () => {
    const fetch = vi.fn(async () => new Response('{}', { status: 200 })) as unknown as typeof globalThis.fetch
    await expect(callGateway([], baseOptions(fetch))).rejects.toThrow(/content/)
  })
})

describe('runEvalCase / runEvalSuite', () => {
  const okCase = {
    id: 'c1',
    messages: [{ role: 'user' as const, content: 'q' }],
    assertions: [{ type: 'contains' as const, value: 'chào' }],
  }

  it('pass khi mọi assertion pass', async () => {
    const r = await runEvalCase(okCase, baseOptions(gatewayMock('xin chào')))
    expect(r.pass).toBe(true)
    expect(r.assertions).toHaveLength(1)
  })

  it('assertion fail → case fail nhưng không error', async () => {
    const r = await runEvalCase(okCase, baseOptions(gatewayMock('hello')))
    expect(r.pass).toBe(false)
    expect(r.error).toBeUndefined()
  })

  it('lỗi hạ tầng → error, không ném ra ngoài', async () => {
    const r = await runEvalCase(okCase, baseOptions(gatewayMock('', 503)))
    expect(r.pass).toBe(false)
    expect(r.error).toContain('503')
  })

  it('suite chạy tuần tự đủ các case', async () => {
    const rs = await runEvalSuite([okCase, { ...okCase, id: 'c2' }], baseOptions(gatewayMock('xin chào')))
    expect(rs.map((r) => r.id)).toEqual(['c1', 'c2'])
  })
})

describe('report', () => {
  it('summarize đếm pass/fail', async () => {
    const rs = await runEvalSuite(
      [
        { id: 'a', messages: [], assertions: [{ type: 'contains', value: 'chào' }] },
        { id: 'b', messages: [], assertions: [{ type: 'contains', value: 'xxx' }] },
      ],
      baseOptions(gatewayMock('xin chào')),
    )
    expect(summarize(rs)).toEqual({ total: 2, passed: 1, failed: 1 })
  })

  it('formatReport in tiêu đề + preview output khi fail + lỗi hạ tầng', () => {
    const long = 'y'.repeat(250)
    const text = formatReport([
      { id: 'ok', pass: true, assertions: [{ pass: true, detail: 'contains "a"' }], output: 'a' },
      { id: 'bad', pass: false, assertions: [{ pass: false, detail: 'contains "z"' }], output: long },
      { id: 'err', pass: false, assertions: [], output: '', error: 'gateway trả 500' },
    ])
    expect(text).toContain('# AI Eval: 1/3 pass')
    expect(text).toContain('❌ bad')
    expect(text).toContain('…') // output dài bị cắt
    expect(text).toContain('Lỗi hạ tầng: gateway trả 500')
  })
})
