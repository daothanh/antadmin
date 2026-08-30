import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { ComponentMeta, DocEntry, Knowledge, PackageMeta, TokenSet } from './types'

// Nạp tri thức đã bundle (data/*.json) — sinh lúc build từ nguồn core, giữ
// server chạy standalone trong repo sản phẩm. Đường dẫn tính từ file dist.

function loadJson<T>(rel: string): T {
  const url = new URL(`../data/${rel}`, import.meta.url)
  return JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as T
}

export function loadKnowledge(): Knowledge {
  return {
    components: loadJson<ComponentMeta[]>('components.json'),
    tokens: loadJson<TokenSet>('tokens.json'),
    docs: loadJson<DocEntry[]>('docs.json'),
    packages: loadJson<PackageMeta[]>('packages.json'),
  }
}

export function loadVersion(): string {
  const url = new URL('../package.json', import.meta.url)
  const pkg = JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as { version?: string }
  return pkg.version ?? '0.0.0'
}
