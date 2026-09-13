import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const PUBLIC_PACKAGES = [
  'ai',
  'cli',
  'composables',
  'eslint-config',
  'nuxt-layer-base',
  'theme',
  'tsconfig',
  'ui',
  'utils',
]

test('S-HAPPY-01: publish package qua npm OIDC sau quality gate', () => {
  const workflow = read('.github/workflows/release.yml')

  assert.match(workflow, /changesets\/action\/select-mode@v2/)
  assert.match(workflow, /changesets\/action\/pack@v2/)
  assert.match(workflow, /changesets\/action\/publish@v2/)
  assert.match(workflow, /pack:\s*\n\s*needs:\s*\n\s*- select-mode\s*\n\s*- quality/)
  assert.match(workflow, /quality:\s*\n\s*needs: select-mode/)
  assert.match(workflow, /- run: pnpm lint/)
  assert.match(workflow, /- run: pnpm typecheck/)
  assert.match(workflow, /- run: pnpm test/)
  assert.match(workflow, /- run: pnpm test:release/)
  assert.match(workflow, /environment: npm-production/)
  assert.match(workflow, /id-token:\s*write/)
  assert.equal([...workflow.matchAll(/id-token:\s*write/g)].length, 1)
  assert.match(workflow, /pack-dir-artifact-id:\s*\$\{\{\s*steps\.pack\.outputs\.pack-dir-artifact-id\s*\}\}/)
  assert.match(workflow, /pack-dir-artifact-id:\s*\$\{\{\s*needs\.pack\.outputs\.pack-dir-artifact-id\s*\}\}/)
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN/)
})

test('S-EDGE-01: workflow giữ quyền tối thiểu và không chạy song song', () => {
  const workflow = read('.github/workflows/release.yml')

  assert.match(workflow, /changesets\/action\/version@v2/)
  assert.match(workflow, /mode\s*==\s*'version'/)
  assert.match(workflow, /mode\s*==\s*'publish'/)
  assert.match(workflow, /permissions:\s*\{\s*\}/)
  assert.match(workflow, /concurrency:\s*\n\s*group: release-main\s*\n\s*cancel-in-progress: false/)
  assert.equal([...workflow.matchAll(/runtime:\s*node@24/g)].length, 5)
  assert.equal([...workflow.matchAll(/persist-credentials: false/g)].length, 5)
  assert.doesNotMatch(workflow, /self-hosted|require-lockfile:|actions\/setup-node/)
})

test('S-REGR-01: chính xác 9 package public MIT; MCP core-only', () => {
  const packagesDir = new URL('../packages/', import.meta.url)
  const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => existsSync(new URL(`../packages/${name}/package.json`, import.meta.url)))

  assert.deepEqual(packageDirs.sort(), [...PUBLIC_PACKAGES, 'mcp'].sort())

  const versions = new Set()
  for (const directory of PUBLIC_PACKAGES) {
    const manifest = JSON.parse(read(`packages/${directory}/package.json`))
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/, `${manifest.name} phải là version stable`)
    versions.add(manifest.version)
    assert.equal(manifest.license, 'MIT', manifest.name)
    assert.equal(manifest.private, undefined, manifest.name)
    assert.equal(manifest.publishConfig?.access, 'public', manifest.name)
    assert.equal(manifest.publishConfig?.registry, 'https://registry.npmjs.org', manifest.name)
    assert.equal(manifest.repository?.url, 'https://github.com/daothanh/antadmin.git', manifest.name)
    assert.equal(manifest.repository?.directory, `packages/${directory}`, manifest.name)
    assert.ok(existsSync(new URL(`../packages/${directory}/LICENSE`, import.meta.url)), manifest.name)
    for (const [dependency, version] of Object.entries(manifest.dependencies ?? {})) {
      if (dependency.startsWith('@antadmin/')) {
        assert.equal(version, 'workspace:*', `${manifest.name} -> ${dependency} phải link local khi dev`)
      }
    }
  }

  assert.equal(versions.size, 1, '9 package public phải cùng version (lockstep)')

  const mcp = JSON.parse(read('packages/mcp/package.json'))
  assert.equal(mcp.private, true)
  assert.equal(mcp.publishConfig, undefined)

  const changesets = JSON.parse(read('.changeset/config.json'))
  assert.deepEqual(changesets.fixed, [PUBLIC_PACKAGES.map(name => `@antadmin/${name}`)])
  assert.ok(existsSync(new URL('../pnpm-lock.yaml', import.meta.url)))
  assert.ok(existsSync(new URL('../LICENSE', import.meta.url)))
})

test('S-REGR-02: artifact declarations và scaffold không phụ thuộc registry private', () => {
  const cli = JSON.parse(read('packages/cli/package.json'))
  const layer = JSON.parse(read('packages/nuxt-layer-base/package.json'))
  const templateNpmrc = read('packages/cli/templates/app/_npmrc')
  const templateCi = read('packages/cli/templates/app/.gitlab-ci.yml')
  const templateDockerfile = read('packages/cli/templates/app/Dockerfile')
  const templatePackage = read('packages/cli/templates/app/package.json')

  assert.ok(existsSync(new URL(`../packages/cli/${cli.bin['create-antadmin-app']}`, import.meta.url)))
  assert.ok(layer.files.includes('antadmin.d.ts'))
  assert.ok(layer.files.includes('!server/**/*.test.ts'))
  assert.ok(existsSync(new URL('../packages/nuxt-layer-base/antadmin.d.ts', import.meta.url)))
  assert.doesNotMatch(templateNpmrc, /@antadmin:registry|_authToken|NPM_TOKEN|api\/v4/)
  assert.doesNotMatch(templateCi, /NPM_TOKEN|read_package_registry|docker_npm_secret|--secret "id=npmrc/)
  assert.doesNotMatch(templateDockerfile, /npmrc,target=\/root\/\.npmrc|--secret id=npmrc/)
  assert.doesNotMatch(templatePackage, /__TASCO_VERSION__/)
  assert.ok(!existsSync(new URL('../packages/cli/templates/app/.mcp.json', import.meta.url)))
})

test('S-REGR-03: GitLab giữ job lân cận và không publish package', () => {
  const gitlab = read('.gitlab-ci.yml')

  assert.match(gitlab, /^quality:/m)
  assert.match(gitlab, /^ai-review:/m)
  assert.match(gitlab, /^ai-eval:/m)
  assert.doesNotMatch(gitlab, /^deploy:pages:/m)
  assert.doesNotMatch(gitlab, /^release:/m)
  assert.doesNotMatch(gitlab, /changeset publish|write_package_registry/)
})

test('S-REGR-04: docs deploy lên GitHub Pages, không dùng Cloudflare', () => {
  const workflow = read('.github/workflows/docs.yml')
  const config = read('docs/.vitepress/config.ts')

  assert.match(workflow, /push:\s*\n\s*branches:\s*\n\s*- main/)
  assert.match(workflow, /workflow_dispatch/)
  assert.match(workflow, /actions\/upload-pages-artifact@v3/)
  assert.match(workflow, /actions\/deploy-pages@v4/)
  assert.match(workflow, /pages:\s*write/)
  assert.match(workflow, /id-token:\s*write/)
  assert.match(workflow, /build-storybook/)
  assert.match(workflow, /pnpm --filter docs build/)
  assert.match(workflow, /cp -R packages\/ui\/storybook-static/)
  assert.doesNotMatch(workflow, /CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|wrangler/)
  assert.match(config, /base:\s*'\/antadmin\/'/)
  assert.doesNotMatch(config, /web\.docs\.vtii\.vn/)
})

test('S-REGR-05: app scaffold cài và typecheck được ngoài monorepo với pnpm 12', () => {
  const rootManifest = JSON.parse(read('package.json'))
  const layer = JSON.parse(read('packages/nuxt-layer-base/package.json'))
  const templatePackage = JSON.parse(read('packages/cli/templates/app/package.json'))
  const templateWorkspace = read('packages/cli/templates/app/pnpm-workspace.yaml')
  const templateDockerfile = read('packages/cli/templates/app/Dockerfile')

  // pnpm 11+ fail ERR_PNPM_IGNORED_BUILDS khi dependency có build script chưa được quyết định.
  assert.match(templateWorkspace, /^allowBuilds:\n(?: {2}.*\n)* {2}esbuild: true$/m)
  assert.match(templateWorkspace, /^ {2}core-js: false$/m)
  // pnpm 11+ bỏ qua các setting cũ này, chép từ cấu hình pnpm 10 sang sẽ không có tác dụng.
  assert.doesNotMatch(templateWorkspace, /onlyBuiltDependencies|neverBuiltDependencies/)
  const copyWorkspaceAt = templateDockerfile.search(/^COPY .*\bpnpm-workspace\.yaml\b/m)
  // Bỏ qua dòng comment: comment trong Dockerfile cũng nhắc tới `pnpm install`.
  const installAt = templateDockerfile.search(/^(?!\s*#).*\bpnpm install\b/m)
  assert.ok(copyWorkspaceAt !== -1 && copyWorkspaceAt < installAt, 'Dockerfile phải copy pnpm-workspace.yaml trước pnpm install')
  assert.equal(templatePackage.packageManager, rootManifest.packageManager, 'template pin cùng bản pnpm core đang dùng')

  // App typecheck thẳng source server của layer → layer tự mang type Node, không trông vào hoist.
  assert.ok(layer.dependencies['@types/node'], 'layer phải khai báo @types/node trong dependencies')
  const serverDir = new URL('../packages/nuxt-layer-base/server/', import.meta.url)
  const nodeSources = readdirSync(serverDir, { recursive: true })
    .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .filter(file => /from 'node:|\bBuffer\b|\bprocess\./.test(readFileSync(new URL(file, serverDir), 'utf8')))
  assert.ok(nodeSources.length > 0)
  for (const file of nodeSources) {
    assert.match(readFileSync(new URL(file, serverDir), 'utf8'), /^\/\/\/ <reference types="node" \/>$/m, file)
  }
})
