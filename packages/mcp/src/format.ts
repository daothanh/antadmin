import type { ComponentMeta, PackageMeta } from './types'

/** Dòng tóm tắt 1 component cho list_components. */
export function formatComponentSummary(c: ComponentMeta): string {
  const desc = c.description ? ` — ${c.description}` : ''
  return `${c.name} (${c.props.length} props)${desc}`
}

/** Chi tiết đầy đủ 1 component cho get_component. */
export function formatComponentDetail(c: ComponentMeta): string {
  const out: string[] = [`# ${c.name}`, c.path]
  if (c.description) out.push('', c.description)

  out.push('', '## Props')
  if (c.props.length) {
    for (const p of c.props) {
      const flag = p.optional ? '?' : ''
      const def = p.default !== undefined ? ` = ${p.default}` : ''
      const doc = p.description ? `  // ${p.description}` : ''
      out.push(`- ${p.name}${flag}: ${p.type}${def}${doc}`)
    }
  } else {
    out.push('(không có props)')
  }

  if (c.emits.length) {
    out.push('', '## Emits', ...c.emits.map((e) => `- ${e}`))
  }
  return out.join('\n')
}

/** Bảng packages cho list_packages. */
export function formatPackages(pkgs: PackageMeta[]): string {
  if (!pkgs.length) return 'Không có package.'
  return pkgs
    .map((p) => `${p.name}@${p.version}${p.description ? ` — ${p.description}` : ''}`)
    .join('\n')
}
