import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Chỉ test util thuần ở server/ (không đụng .nuxt / app runtime).
    include: ['server/**/*.test.ts'],
  },
})
