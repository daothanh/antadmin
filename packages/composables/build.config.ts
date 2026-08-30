import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  externals: ['nuxt', 'nuxt/app', '#app', '#imports', 'vue'],
  rollup: {
    emitCJS: false,
  },
})
