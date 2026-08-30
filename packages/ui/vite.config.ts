import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.json', include: ['src'], cleanVueFileName: true, rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // Không bundle vào thư viện — consumer cung cấp qua peer/deps.
      external: ['vue', 'ant-design-vue', /^ant-design-vue\//, '@antadmin/theme', '@antadmin/utils'],
    },
  },
})
