import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { filterProducts, formatCourseDate, formatPrice } from '../src/lib/catalog.ts'

const products = JSON.parse(await readFile(new URL('../../specs/products.json', import.meta.url), 'utf8'))

test('the initial catalog preserves all eight unique IDs and canonical order', () => {
  assert.equal(products.length, 8)
  assert.equal(new Set(products.map(({ id }) => id)).size, 8)
  assert.deepEqual(filterProducts(products, '', 'tutti'), products)
  for (const category of ['clinica', 'scuola', 'lavoro', 'formazione']) {
    assert.equal(filterProducts(products, '', category).length, 2)
  }
})

test('search trims, removes accents, ignores case and searches only names', () => {
  assert.deepEqual(filterProducts(products, '  ÉQUILI\u0301BRIA  ', 'tutti').map(({ id }) => id), ['equilibria'])
  assert.deepEqual(filterProducts(products, 'apprendimento', 'tutti').map(({ id }) => id), ['apprendo'])
  assert.deepEqual(filterProducts(products, 'Elena Moretti', 'tutti'), [])
})

test('category and name intersect without reordering results', () => {
  assert.deepEqual(filterProducts(products, 'clinico', 'clinica'), [])
  assert.deepEqual(filterProducts(products, 'clinico', 'formazione').map(({ id }) => id), ['fondamenti-assessment'])
  assert.deepEqual(filterProducts(products, 'delle', 'tutti').map(({ id }) => id), ['neurovia', 'crescita', 'talentia', 'sinergia'])
})

test('repeated filtering preserves the original records and allocates a new array', () => {
  const input = Object.freeze(products.map(product => Object.freeze({ ...product })))
  const firstMatch = filterProducts(input, 'equilibria', 'clinica')
  assert.equal(firstMatch[0], input.find(product => product.id === 'equilibria'))
  assert.deepEqual(filterProducts(input, 'nessun prodotto', 'tutti'), [])
  const restored = filterProducts(input, '', 'tutti')
  assert.notEqual(restored, input)
  assert.deepEqual(restored, products)
})

test('prices use Italian grouping and civil course dates use UTC', () => {
  assert.equal(formatPrice(125000), '1.250,00\u00a0€')
  assert.equal(formatCourseDate('2027-03-15'), '15 marzo 2027')
})
