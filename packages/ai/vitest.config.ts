import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // Test chạy trên nguồn @antadmin/utils (khỏi cần build dist trước).
      '@antadmin/utils': fileURLToPath(new URL('../utils/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Bỏ barrel + type + glue h3 (handler chỉ là keo dán quanh sanitizeChatRequest đã test).
      exclude: [
        'src/**/*.test.ts',
        'src/index.ts',
        'src/types.ts',
        'src/server/index.ts',
        'src/prompts/index.ts',
        'src/eval/index.ts',
      ],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
})
