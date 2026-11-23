import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const load = async (file, expressions) => runInNewContext(
  await readFile(new URL('../resources/js/' + file + '.js', import.meta.url), 'utf8') + '\n;({' + expressions + '})',
)
const { normalizeName } = await load('catalog', 'normalizeName')
const { readCart, cartTotals, money } = await load('cart', 'readCart, cartTotals, money')
const { validateContact } = await load('contact', 'validateContact')
const products = new Map([
  ['equilibria', { discountPriceCents: 14900 }],
  ['neurovia', { discountPriceCents: 19600 }],
])

test('normalizes spaces, case and diacritics', () => {
  assert.equal(normalizeName('  NÉUROVIA '), 'neurovia')
})

test('validates stored IDs and integer quantities and keeps the first valid occurrence', () => {
  const input = [null, {}, { id: 'other', quantity: 1 }, { id: 'equilibria', quantity: 2.5 },
    { id: 'equilibria', quantity: 2 }, { id: 'equilibria', quantity: 1 },
    { id: 'neurovia', quantity: 100 }, { id: 'neurovia', quantity: 1 }]
  const entries = readCart(JSON.stringify(input), products)
  assert.equal(JSON.stringify(entries), '[{"id":"equilibria","quantity":2},{"id":"neurovia","quantity":1}]')
  assert.equal(JSON.stringify(cartTotals(entries, products)), '{"units":3,"cents":49400}')
  assert.equal(money(125099), '1.250,99\u00a0€')
  assert.equal(readCart('{', products).length, 0)
})

test('validates trimmed Unicode names, email syntax and minimum message length', () => {
  assert.equal(Object.keys(validateContact({ name: 'È', email: 'a..b@example.com', message: ' troppo ' })).join(','), 'name,email,message')
  assert.equal(Object.keys(validateContact({ name: ' Èa ', email: ' nome+test@example.it ', message: 'Messaggio di prova' })).length, 0)
})
