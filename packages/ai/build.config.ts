import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index', 'src/server/index', 'src/prompts/index', 'src/eval/index'],
  declaration: true,
  clean: true,
  externals: ['vue', 'h3'],
  rollup: {
    emitCJS: false,
  },
})
