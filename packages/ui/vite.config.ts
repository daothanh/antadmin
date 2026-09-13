import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// api-extractor (rollupTypes) viết lại `typeof import('x').y` thành `y` — rơi mất `typeof`, d.ts publish lỗi TS2749.
// TS in dạng này khi export để type tự suy luận mà type đó dùng giá trị của module không import trong file (vd map
// `components` in lại cả cây type component) → chặn ngay lúc build thay vì phát hành d.ts hỏng.
const TYPEOF_IMPORT_RE = /typeof import\(/

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      include: ['src'],
      // Test/story không vào bản publish (rollup chỉ đi từ index.ts): khỏi sinh d.ts, chốt chặn dưới khỏi báo nhầm.
      exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts'],
      cleanVueFileName: true,
      rollupTypes: true,
      beforeWriteFile(filePath, content) {
        if (TYPEOF_IMPORT_RE.test(content)) {
          throw new Error(
            `[@antadmin/ui] ${filePath} có \`typeof import(...)\`: api-extractor làm rơi \`typeof\` khi rollup d.ts. ` +
              'Khai báo type tường minh cho export đó (vd map `components` trong install.ts).',
          )
        }
      },
    }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // Không bundle vào thư viện — consumer cung cấp qua peer/deps.
      external: [
        'vue',
        'ant-design-vue',
        /^ant-design-vue\//,
        '@antadmin/theme',
        '@antadmin/utils',
        '@tabler/icons-vue',
      ],
    },
  },
})
