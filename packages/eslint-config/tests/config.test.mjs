import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Linter, ESLint } from 'eslint'
import { base, vue, noDirectAntdv } from '../index.js'

const linter = new Linter()

test('base: JS hợp lệ không báo lỗi', () => {
  const code = 'export function add(a, b) {\n  return a + b\n}\n'
  const messages = linter.verify(code, [...base])
  assert.deepEqual(messages.filter((m) => m.severity === 2), [])
})

test('base: TS hợp lệ không báo lỗi', () => {
  const code = 'type Id = string\n' + 'export function get(id: Id): Id {\n  return id\n}\n'
  const messages = linter.verify(code, [...base])
  assert.deepEqual(messages.filter((m) => m.severity === 2), [])
})

test('base: bắt biến khai báo không dùng (bỏ qua tiền tố _)', () => {
  const messages = linter.verify('const unused = 1\nconst _ok = 2\n', [...base])
  assert.ok(messages.some((m) => m.ruleId === '@typescript-eslint/no-unused-vars'))
  assert.ok(!messages.some((m) => m.message.includes('_ok')))
})

test('noDirectAntdv: chặn import trực tiếp ant-design-vue', () => {
  const messages = linter.verify("import { Button } from 'ant-design-vue'\n", [noDirectAntdv])
  assert.equal(messages.length, 1)
  assert.match(messages[0].message, /Không import trực tiếp ant-design-vue/)
})

test('vue: parse SFC có <script setup lang="ts"> hợp lệ', () => {
  const code = [
    '<template><CButton>{{ x }}</CButton></template>',
    '<script setup lang="ts">',
    'const x: number = 1',
    '</script>',
    '',
  ].join('\n')
  const messages = linter.verify(code, [...vue], { filename: 'TestPage.vue' })
  assert.deepEqual(messages.filter((m) => m.severity === 2), [])
})

test('vue: chặn import ant-design-vue ngay trong SFC', () => {
  const code = [
    '<script setup lang="ts">',
    "import { Button } from 'ant-design-vue'",
    '</script>',
    '',
  ].join('\n')
  const messages = linter.verify(code, [...vue], { filename: 'TestPage.vue' })
  assert.ok(messages.some((m) => m.ruleId === 'no-restricted-imports'))
})

test('ignores: bỏ qua dist/.nuxt/.output/coverage/storybook-static', async () => {
  const eslint = new ESLint({
    cwd: process.cwd(),
    overrideConfigFile: true,
    overrideConfig: [...base],
  })
  for (const path of [
    'dist/index.js',
    '.nuxt/index.js',
    '.output/index.js',
    'coverage/index.js',
    'storybook-static/index.js',
  ]) {
    const results = await eslint.lintText('const x = 1\n', { filePath: path })
    assert.equal(results[0]?.errorCount ?? 0, 0, `${path} phải bị ignore`)
  }
})

test('peerDependencies chỉ chấp nhận ESLint 10', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  )
  assert.match(manifest.peerDependencies.eslint, /^\^10\./)
  assert.doesNotMatch(manifest.peerDependencies.eslint, /\^9/)
})