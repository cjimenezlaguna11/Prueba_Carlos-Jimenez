import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { maxCartQuantity, readCart, summarizeCart, updateCart } from '../src/lib/cart.ts'

const catalog = JSON.parse(await readFile(new URL('../../specs/products.json', import.meta.url), 'utf8'))
const products = new Map(catalog.map(product => [product.id, product]))
const productIds = new Set(products.keys())

test('cart stores unique IDs, merges additions, decrements and removes lines', () => {
  const first = updateCart([], { type: 'add', id: 'equilibria' })
  const second = updateCart(first, { type: 'add', id: 'equilibria' })
  const third = updateCart(second, { type: 'add', id: 'neurovia' })
  assert.deepEqual(first, [{ id: 'equilibria', quantity: 1 }])
  assert.deepEqual(third, [{ id: 'equilibria', quantity: 2 }, { id: 'neurovia', quantity: 1 }])
  assert.deepEqual(summarizeCart(third, products), { units: 3, subtotalCents: 49400 })
  assert.deepEqual(updateCart(third, { type: 'decrease', id: 'neurovia' }), second)
  assert.deepEqual(updateCart(third, { type: 'remove', id: 'equilibria' }), [{ id: 'neurovia', quantity: 1 }])
  assert.deepEqual(updateCart(third, { type: 'clear' }), [])
})

test('validated storage keeps the first valid occurrence and discards stale, malformed or out-of-range entries', () => {
  assert.deepEqual(readCart('invalid JSON', productIds), [])
  assert.deepEqual(readCart('{}', productIds), [])
  const raw = JSON.stringify([
    null, { id: 'missing', quantity: 3 }, { id: 'equilibria', quantity: '2' },
    { id: 'equilibria', quantity: 2, discountPriceCents: 1 }, { id: 'equilibria', quantity: 3 },
    { id: 'neurovia', quantity: 0 }, { id: 'neurovia', quantity: maxCartQuantity + 1 }, { id: 'neurovia', quantity: 1.2 }
  ])
  const saved = readCart(raw, productIds)
  assert.deepEqual(saved, [{ id: 'equilibria', quantity: 2 }])
  assert.deepEqual(summarizeCart(saved, products), { units: 2, subtotalCents: 29800 })
  const capped = [{ id: 'equilibria', quantity: maxCartQuantity }]
  assert.equal(updateCart(capped, { type: 'add', id: 'equilibria' }), capped)
})
