import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Test chạy trên nguồn @antadmin/utils (khỏi cần build dist trước).
      '@antadmin/utils': fileURLToPath(new URL('../utils/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Chỉ gate các component đã có test; mở rộng dần khi thêm test mới.
      include: [
        'src/components/CChat.vue',
        'src/components/CChatMessage.vue',
        'src/components/CTag.vue',
        'src/components/CStatus.vue',
        'src/components/CInputCurrency.vue',
        'src/components/CInputPercent.vue',
        'src/components/CFilterBar.vue',
        'src/components/CForm.vue',
        'src/components/CTable.vue',
        'src/internal/table.ts',
        'src/useConfirm.ts',
        'src/useErrorHandler.ts',
      ],
      thresholds: { lines: 85, functions: 90, branches: 70, statements: 85 },
    },
  },
})
