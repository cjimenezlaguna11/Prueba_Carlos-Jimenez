import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const specs = path.join(root, 'specs')
const app = path.join(root, 'version-a')
const output = path.join(app, '.generated')
const tokens = JSON.parse(await readFile(path.join(specs, 'design-tokens.json'), 'utf8'))
const { primitives, semantic, components } = tokens

const flattenGroups = (groups) => Object.fromEntries(
  Object.entries(groups).flatMap(([group, values]) =>
    Object.entries(values).map(([key, value]) => [`${group}-${key}`, value])
  )
)

function cssValue(value) {
  if (typeof value !== 'string') return value
  return value.replace(/^\{(primitives|semantic|components)\.(.+)\}$/, (_, scope, name) => {
    const prefix = scope === 'primitives' ? 'base-' : ''
    return `var(--ds-${prefix}${name.replaceAll('.', '-')})`
  })
}

function declarations(values, indentation = '  ') {
  return Object.entries(values)
    .map(([key, value]) => `${indentation}--ds-${key}: ${cssValue(value)};`)
    .join('\n')
}

const { breakpoint, ...cssPrimitives } = primitives
const base = Object.fromEntries(
  Object.entries(flattenGroups(cssPrimitives)).map(([key, value]) => [`base-${key}`, value])
)
if (Object.keys(semantic.light).sort().join() !== Object.keys(semantic.dark).sort().join()) {
  throw new Error('Light and dark must define the same semantic tokens.')
}

const light = { ...base, ...semantic.shared, ...semantic.light, ...flattenGroups(components) }
const expectedCss = `/* Generated from design-tokens.json. Edit the JSON source. */
:root {
  color-scheme: light;
${declarations(light)}
}

:root[data-theme="dark"] {
  color-scheme: dark;
${declarations(semantic.dark)}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
${declarations(semantic.dark, '    ')}
  }
}
`

const referenceCss = (await readFile(path.join(specs, 'design-tokens.css'), 'utf8')).replaceAll('\r\n', '\n')
if (referenceCss !== expectedCss) throw new Error('Shared CSS does not match design-tokens.json.')

const breakpoints = Object.entries(breakpoint).map(([key, value]) => `  --breakpoint-${key}: ${value};`)
await mkdir(output, { recursive: true })
await Promise.all([
  copyFile(path.join(specs, 'products.json'), path.join(output, 'products.json')),
  copyFile(path.join(specs, 'design-tokens.json'), path.join(output, 'design-tokens.json')),
  writeFile(path.join(output, 'design-tokens.css'), referenceCss),
  writeFile(path.join(output, 'breakpoints.css'), `@theme {\n${breakpoints.join('\n')}\n}\n`),
  cp(path.join(root, 'assets/catalog'), path.join(app, 'public/images'), { recursive: true })
])
