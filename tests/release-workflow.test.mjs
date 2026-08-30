import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const readOptional = path => existsSync(new URL(path, root)) ? read(path) : ''

test('S-HAPPY-01: publish package qua npm OIDC', () => {
  const workflow = readOptional('.github/workflows/release.yml')

  assert.match(workflow, /changesets\/action\/select-mode@v2/)
  assert.match(workflow, /changesets\/action\/pack@v2/)
  assert.match(workflow, /changesets\/action\/publish@v2/)
  assert.match(workflow, /id-token:\s*write/)
  assert.match(workflow, /pack-dir-artifact-id:\s*\$\{\{\s*steps\.pack\.outputs\.pack-dir-artifact-id\s*\}\}/)
  assert.match(workflow, /pack-dir-artifact-id:\s*\$\{\{\s*needs\.pack\.outputs\.pack-dir-artifact-id\s*\}\}/)
  assert.doesNotMatch(workflow, /pack-artifact-id:/)
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN/)
})

test('S-EDGE-01: tách mode version, publish và none', () => {
  const workflow = readOptional('.github/workflows/release.yml')

  assert.match(workflow, /changesets\/action\/version@v2/)
  assert.match(workflow, /mode\s*==\s*'version'/)
  assert.match(workflow, /mode\s*==\s*'publish'/)
  assert.match(workflow, /permissions:\s*\{\s*\}/)
  assert.equal([...workflow.matchAll(/runtime:\s*node@24/g)].length, 4)
  assert.doesNotMatch(workflow, /require-lockfile:/)
  assert.doesNotMatch(workflow, /actions\/setup-node/)
})

test('S-REGR-01: mọi package trỏ npmjs public và đúng GitHub repository', () => {
  const packagesDir = new URL('../packages/', import.meta.url)
  const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => existsSync(new URL(`../packages/${name}/package.json`, import.meta.url)))

  assert.equal(packageDirs.length, 10)

  for (const directory of packageDirs) {
    const manifest = JSON.parse(read(`packages/${directory}/package.json`))
    assert.equal(manifest.publishConfig?.access, 'public', manifest.name)
    assert.equal(manifest.publishConfig?.registry, 'https://registry.npmjs.org', manifest.name)
    assert.equal(manifest.repository?.url, 'https://github.com/daothanh/antadmin.git', manifest.name)
    assert.equal(manifest.repository?.directory, `packages/${directory}`, manifest.name)
  }

  const changesets = JSON.parse(read('.changeset/config.json'))
  const npmrc = read('.npmrc')
  assert.equal(changesets.access, 'public')
  assert.doesNotMatch(npmrc, /@antadmin:registry|api\/v4/)
})

test('S-REGR-02: GitLab giữ job lân cận và bỏ release package cũ', () => {
  const gitlab = read('.gitlab-ci.yml')

  assert.match(gitlab, /^quality:/m)
  assert.match(gitlab, /^ai-review:/m)
  assert.match(gitlab, /^ai-eval:/m)
  assert.match(gitlab, /^deploy:pages:/m)
  assert.doesNotMatch(gitlab, /^release:/m)
})
