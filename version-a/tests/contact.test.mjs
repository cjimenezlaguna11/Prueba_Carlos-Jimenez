import assert from 'node:assert/strict'
import test from 'node:test'
import { contactFields, emptyContact, validateContact } from '../src/lib/contact.ts'

test('all three required fields report errors in document order', () => {
  assert.deepEqual(Object.keys(validateContact(emptyContact)), contactFields)
})

test('minimum lengths use code points and exclude surrounding whitespace', () => {
  const values = { name: ' 😀 ', email: ' a@example.it ', message: ' abcdefgh😀 ' }
  assert.deepEqual(Object.keys(validateContact(values)), ['name', 'message'])
  assert.deepEqual(validateContact({ ...values, name: ' À😀 ', message: ' abcdefghi😀 ' }), {})
})

test('email validates trimmed values and rejects malformed domain labels', () => {
  const values = { name: 'Ada', email: ' utente+1@example.it ', message: 'Una richiesta.' }
  assert.deepEqual(validateContact(values), {})
  for (const email of ['utente@', 'utente@-example.it', 'utente@example..it', 'utente @example.it', 'a..b@example.it', 'a,b@example.it']) {
    assert.deepEqual(Object.keys(validateContact({ ...values, email })), ['email'])
  }
})
