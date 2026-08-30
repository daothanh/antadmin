import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Bỏ barrel/type/glue: index (entry), server (wire MCP), data (đọc file),
      // types (kiểu thuần) — logic thật nằm ở catalog/docs/tokens/format.
      exclude: [
        'src/**/*.test.ts',
        'src/types.ts',
        'src/index.ts',
        'src/server.ts',
        'src/data.ts',
      ],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
})
