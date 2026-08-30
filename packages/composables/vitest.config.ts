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
      // Bỏ file khai báo type + barrel + glue Nuxt chưa unit-test được.
      exclude: ['src/**/*.test.ts', 'src/index.ts', 'src/types.ts', 'src/usePermission.ts'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
})
