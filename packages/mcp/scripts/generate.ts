import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cssVars } from '@antadmin/theme'
import { extractComponentMeta } from '../src/catalog'
import type { ComponentMeta, DocEntry, PackageMeta } from '../src/types'

// Sinh data/*.json từ nguồn core (chạy trước unbuild, sau khi ^build đã build
// @antadmin/theme). Nhờ vậy server chạy standalone trong repo sản phẩm.

const root = new URL('../../../', import.meta.url) // repo root
const pkgDir = new URL('../', import.meta.url) // packages/mcp
const abs = (base: URL, rel: string) => fileURLToPath(new URL(rel, base))
const repo = (rel: string) => abs(root, rel)

function walk(dir: string, ext: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue
    const p = `${dir}/${e.name}`
    if (e.isDirectory()) out.push(...walk(p, ext))
    else if (e.name.endsWith(ext)) out.push(p)
  }
  return out
}

function genComponents(): ComponentMeta[] {
  const dir = repo('packages/ui/src/components')
  const metas: ComponentMeta[] = []
  for (const file of walk(dir, '.vue')) {
    const src = readFileSync(file, 'utf8')
    const rel = file.slice(repo('').length)
    const name = file.split('/').pop()!.replace('.vue', '')
    const meta = extractComponentMeta(src, rel, name)
    if (meta) metas.push(meta)
  }
  return metas.sort((a, b) => a.name.localeCompare(b.name))
}

function genTokens() {
  return { light: cssVars('light'), dark: cssVars('dark') }
}

function genDocs(): DocEntry[] {
  const files = [repo('CLAUDE.md'), ...walk(repo('docs'), '.md')]
  const docs: DocEntry[] = []
  for (const file of files) {
    if (!existsSync(file)) continue
    const content = readFileSync(file, 'utf8')
    const heading = content.match(/^#\s+(.+)$/m)?.[1]
    const rel = file.slice(repo('').length)
    docs.push({ title: heading ?? rel, path: rel, content })
  }
  return docs
}

function genPackages(): PackageMeta[] {
  const dir = repo('packages')
  const pkgs: PackageMeta[] = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue
    const p = `${dir}/${e.name}/package.json`
    if (!existsSync(p)) continue
    const json = JSON.parse(readFileSync(p, 'utf8')) as PackageMeta & { private?: boolean }
    if (json.name?.startsWith('@antadmin/')) {
      pkgs.push({ name: json.name, version: json.version ?? '', description: json.description ?? '' })
    }
  }
  return pkgs.sort((a, b) => a.name.localeCompare(b.name))
}

const outDir = abs(pkgDir, 'data')
mkdirSync(outDir, { recursive: true })
const write = (name: string, data: unknown) =>
  writeFileSync(`${outDir}/${name}`, JSON.stringify(data, null, 2))

const components = genComponents()
const docs = genDocs()
write('components.json', components)
write('tokens.json', genTokens())
write('docs.json', docs)
write('packages.json', genPackages())

console.log(`[antadmin-mcp] generate: ${components.length} components, ${docs.length} docs`)
