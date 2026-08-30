#!/usr/bin/env node
// @ts-check
import { cp, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = resolve(__dirname, '../templates/app')

/** Đổi tên file template (dotfiles ship dạng _x để npm không nuốt). */
const RENAME_MAP = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
  '_env.example': '.env.example',
  _dockerignore: '.dockerignore',
}

/** @param {string[]} argv */
function parseArgs(argv) {
  const args = argv.slice(2)
  /** @type {{ name?: string, pm: string }} */
  const result = { pm: 'pnpm' }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === undefined) continue
    if (arg === '--pm') {
      result.pm = args[++i] ?? 'pnpm'
    } else if (!arg.startsWith('-') && !result.name) {
      result.name = arg
    }
  }
  return result
}

/** @returns {Promise<string>} */
async function promptName() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = await rl.question('Tên project (vd: antadmin-orders): ')
    return answer.trim()
  } finally {
    rl.close()
  }
}

/** Đọc version của chính CLI để pin dependency @antadmin/*. */
async function getAntAdminVersion() {
  try {
    const pkgRaw = await readFile(resolve(__dirname, '../package.json'), 'utf8')
    const version = JSON.parse(pkgRaw).version
    return typeof version === 'string' ? `^${version}` : 'latest'
  } catch {
    return 'latest'
  }
}

/** Thay placeholder trong nội dung file. @param {string} content @param {Record<string,string>} vars */
function applyVars(content, vars) {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.split(key).join(value),
    content,
  )
}

/** Copy template + thay placeholder + đổi tên dotfiles. @param {string} target @param {Record<string,string>} vars */
async function scaffold(target, vars) {
  await cp(TEMPLATE_DIR, target, { recursive: true })

  // Đổi tên dotfiles.
  for (const [from, to] of Object.entries(RENAME_MAP)) {
    const fromPath = join(target, from)
    if (existsSync(fromPath)) {
      await rename(fromPath, join(target, to))
    }
  }

  // Thay placeholder trong mọi file text.
  await walkAndReplace(target, vars)
}

/** @param {string} dir @param {Record<string,string>} vars */
async function walkAndReplace(dir, vars) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkAndReplace(fullPath, vars)
    } else {
      const content = await readFile(fullPath, 'utf8')
      const replaced = applyVars(content, vars)
      if (replaced !== content) {
        await writeFile(fullPath, replaced)
      }
    }
  }
}

async function main() {
  const { name: argName, pm } = parseArgs(process.argv)
  const name = argName || (await promptName())

  if (!name) {
    console.error('✖ Thiếu tên project.')
    process.exit(1)
  }

  const target = resolve(process.cwd(), name)
  if (existsSync(target) && (await readdir(target)).length > 0) {
    console.error(`✖ Thư mục "${name}" đã tồn tại và không rỗng.`)
    process.exit(1)
  }

  await mkdir(target, { recursive: true })

  const vars = {
    __APP_NAME__: name,
    __TASCO_VERSION__: await getAntAdminVersion(),
  }
  await scaffold(target, vars)

  const installCmd = pm === 'npm' ? 'npm install' : `${pm} install`
  console.log(`\n✔ Đã tạo project AntAdmin tại ./${name}\n`)
  console.log('Các bước tiếp theo:')
  console.log(`  cd ${name}`)
  console.log('  cp .env.example .env   # cấu hình OIDC/backend (hoặc NUXT_OIDC_MOCK=true)')
  console.log(`  ${installCmd}`)
  console.log(`  ${pm === 'npm' ? 'npm run dev' : `${pm} dev`}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
