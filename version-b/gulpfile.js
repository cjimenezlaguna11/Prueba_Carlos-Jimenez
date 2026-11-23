import { copyFile, mkdir, readFile, writeFile, cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import gulp from 'gulp'
import stylus from 'stylus'
import { minify } from 'terser'

const { series, parallel, watch: watchFiles } = gulp
const root = new URL('./', import.meta.url)
const local = (path) => fileURLToPath(new URL(path, root))
const sources = ['catalog', 'contact', 'cart', 'header', 'init']

async function prepare() {
  await Promise.all(['build', 'public/build', 'public/images'].map(path => mkdir(local(path), { recursive: true })))
  await Promise.all([
    copyFile(local('../specs/products.json'), local('build/products.json')),
    copyFile(local('../assets/catalog/hero.svg'), local('public/images/hero.svg')),
    cp(local('../assets/catalog/products'), local('public/images/products'), { recursive: true }),
    copyFile(local('../version-a/public/giunti-psychometrics.png'), local('public/giunti-psychometrics.png')),
    copyFile(local('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'), local('public/build/inter.woff2')),
    copyFile(local('node_modules/@fontsource-variable/inter/LICENSE'), local('public/build/Inter-LICENSE.txt')),
  ])
}

async function styles() {
  const [tokens, css, source] = await Promise.all([
    readFile(local('../specs/design-tokens.json'), 'utf8'),
    readFile(local('../specs/design-tokens.css'), 'utf8'),
    readFile(local('resources/stylus/main.styl'), 'utf8'),
  ])
  const breakpoints = JSON.parse(tokens).primitives.breakpoint
  if (!['sm', 'md', 'lg', 'xl', '2xl'].every(key => /^\d+(?:\.\d+)?rem$/.test(breakpoints[key]))) {
    throw new Error('Invalid shared breakpoints')
  }
  const renderer = stylus(source).set('filename', local('resources/stylus/main.styl')).set('compress', true)
  for (const [key, value] of Object.entries(breakpoints)) {
    renderer.define(key === '2xl' ? 'xxl' : key, new stylus.nodes.Unit(Number.parseFloat(value), 'rem'))
  }
  await writeFile(local('public/build/app.css'), css + '\n' + renderer.render())
}

async function scripts() {
  const [jquery, ...modules] = await Promise.all([
    readFile(local('node_modules/jquery/dist/jquery.min.js'), 'utf8'),
    ...sources.map(path => readFile(local('resources/js/' + path + '.js'), 'utf8')),
  ])
  const { code } = await minify('(function ($) { "use strict";\n' + modules.join('\n') + '\n})(window.jQuery);')
  await writeFile(local('public/build/app.js'), jquery.replace(/\/\/# sourceMappingURL=.*$/m, '') + '\n' + code)
}

export const build = series(prepare, parallel(styles, scripts))

export const watch = series(build, function observe() {
  return watchFiles([
    'resources/stylus/**/*.styl', 'resources/js/*.js', '../specs/{products.json,design-tokens.*}',
    '../assets/catalog/**/*', '../version-a/public/giunti-psychometrics.png',
  ], build)
})
