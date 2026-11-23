import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { PNG } from 'pngjs'

const urls = [
  process.env.APP_A_URL ?? 'https://prueba-carlos-jimenez-version-a.vercel.app',
  process.env.APP_B_URL ?? 'http://127.0.0.1:8100',
]
const destination = process.env.SCREENSHOT_DIR ?? 'test-results/parity'
const catalog = JSON.parse(await readFile(new URL('../../specs/products.json', import.meta.url), 'utf8'))
const ids = catalog.map(product => product.id)
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const observations = []
let browser

before(async () => {
  await mkdir(destination, { recursive: true })
  browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' })
})
after(async () => {
  await browser?.close()
  await writeFile(join(destination, 'metrics.json'), JSON.stringify(observations, null, 2) + '\n')
})

async function ready(page, url) {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', entry => { if (entry.type() === 'error') errors.push(entry.text()) })
  const response = await page.goto(url, { waitUntil: 'load' })
  assert.equal(response?.status(), 200)
  await page.locator('#cerca:not([readonly])').waitFor()
  await loadImages(page)
  return errors
}

function loadImages(page) {
  return page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].filter(image => image.getClientRects().length).map(async image => {
      image.loading = 'eager'
      await image.decode()
    }))
  })
}

function measure(a, b) {
  const first = PNG.sync.read(a)
  const second = PNG.sync.read(b)
  const width = Math.max(first.width, second.width)
  const height = Math.max(first.height, second.height)
  let changed = 0
  const diff = new PNG({ width, height })
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ai = (first.width * y + x) * 4
      const bi = (second.width * y + x) * 4
      const di = (width * y + x) * 4
      const outside = x >= first.width || y >= first.height || x >= second.width || y >= second.height
      const mismatch = outside || Math.max(
        Math.abs(first.data[ai] - second.data[bi]),
        Math.abs(first.data[ai + 1] - second.data[bi + 1]),
        Math.abs(first.data[ai + 2] - second.data[bi + 2]),
      ) > 24
      changed += Number(mismatch)
      if (mismatch) diff.data.set([220, 28, 72, 255], di)
      else {
        const grey = Math.round(220 + first.data[ai] * .13)
        diff.data.set([grey, grey, grey, 255], di)
      }
    }
  }
  return {
    sizeA: [first.width, first.height], sizeB: [second.width, second.height],
    changedPercent: Number((100 * changed / (width * height)).toFixed(3)),
    diff,
  }
}

const cards = page => page.locator('[data-product]:visible')
const cardIds = page => cards(page).evaluateAll(nodes => nodes.map(node => node.dataset.product))
const drawer = page => page.getByRole('dialog', { name: 'Il tuo carrello' })
const add = (page, name) => page.getByRole('button', { name: 'Aggiungi ' + name + ' al carrello' })
const cart = page => page.getByRole('button', { name: /^Apri carrello/ })
const category = (page, name) => page.getByRole('group', { name: 'Filtra per categoria' }).getByRole('button', { name, exact: true })
const mobileMenu = page => page.getByRole('button', { name: 'Apri menu' })
const reset = page => page.getByRole('button', { name: 'Cancella filtri', exact: true })
const submit = page => page.getByRole('button', { name: 'Simula invio' })
const focus = page => page.evaluate(() => document.activeElement?.id)
const shell = page => page.evaluate(() => {
  const rect = el => {
    const { x, y, width, height } = el.getBoundingClientRect()
    return [x + scrollX, y + scrollY, width, height].map(value => Math.round(value * 10) / 10)
  }
  return Object.fromEntries(['header', '#hero-title', '#catalogo', '#cerca', '[data-product]', '#guida', '#contatti', 'footer']
    .map(selector => [selector, rect(document.querySelector(selector))]))
})
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)

async function capture(pair, prefix, state, selector, fullPage = false) {
  const screenshots = await Promise.all(pair.map(async (page, i) => {
    await page.mouse.move(0, 0)
    const options = { animations: 'disabled', path: join(destination, prefix + '-' + state + '-' + 'ab'[i] + '.png') }
    if (!selector) return page.screenshot({ ...options, fullPage })
    if (selector === 'header') return page.locator(selector).screenshot(options)
    // Scroll the sticky header out of section clips without changing keyboard focus.
    const clip = await page.locator(selector).evaluate(element => {
      window.scrollTo(0, 0)
      const { x, y, width, height } = element.getBoundingClientRect()
      return { x: Math.floor(x), y: Math.floor(y), width: Math.ceil(width), height: Math.ceil(height) }
    })
    return page.screenshot({ ...options, clip, fullPage: true })
  }))
  const { diff, ...metrics } = measure(...screenshots)
  if (metrics.changedPercent > .1) await writeFile(join(destination, prefix + '-' + state + '-diff.png'), PNG.sync.write(diff))
  observations.push({ prefix, state, ...metrics })
}

for (const width of [375, 768, 1280]) {
  for (const scheme of ['light', 'dark']) {
    test(width + 'px ' + scheme + ': compare layout, filters, details, cart and form against A', async () => {
      const prefix = width + '-' + scheme
      const pair = await Promise.all(urls.map(() => browser.newPage({
        viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce', deviceScaleFactor: 1,
      })))
      const both = action => Promise.all(pair.map(action))
      try {
        const errors = await Promise.all(pair.map((page, i) => ready(page, urls[i])))
        await both(async page => {
          assert.deepEqual(await cardIds(page), ids)
          assert.equal(await page.locator('html').getAttribute('data-theme'), scheme)
          assert.equal(await noOverflow(page), true)
          assert.equal(await page.locator('[aria-label="Prodotti del catalogo"]').evaluate(grid =>
            getComputedStyle(grid).gridTemplateColumns.split(' ').length), width === 1280 ? 3 : width === 768 ? 2 : 1)
        })
        const [a, b] = await both(shell)
        observations.push({ prefix, geometry: { a, b } })
        await capture(pair, prefix, 'full', null, true)
        if (width < 1024) {
          await both(async page => {
            await mobileMenu(page).click()
            await page.getByRole('navigation', { name: 'Principale' }).waitFor()
          })
        }
        await capture(pair, prefix, 'header', width < 1024 ? null : 'header')
        await both(async page => {
          const disclosure = page.getByLabel('Accedi (demo)')
          await disclosure.click()
          await page.getByText('Accesso dimostrativo. Questa pagina non prevede account.').click()
          await page.keyboard.press('Escape')
          assert.equal(await disclosure.evaluate(el => el.parentElement.open), false)
          if (width < 1024) {
            await page.keyboard.press('Escape')
            await mobileMenu(page).waitFor()
          }
        })

        await both(async page => {
          await category(page, 'Formazione').click()
          assert.deepEqual(await cardIds(page), catalog.filter(product => product.categoryId === 'formazione').map(product => product.id))
        })
        await capture(pair, prefix, 'category', '#catalogo')
        await both(async page => {
          await category(page, 'Clinica e Neuropsicologia').click()
          await page.locator('#cerca').fill('  NÉURO  ')
          assert.deepEqual(await cardIds(page), ['neurovia'])
        })
        await capture(pair, prefix, 'search', '#catalogo')
        await both(async page => {
          await page.locator('#cerca').fill('nessuna corrispondenza')
          await page.getByRole('heading', { name: 'Nessun risultato trovato' }).waitFor()
          assert.deepEqual(await cardIds(page), [])
        })
        await capture(pair, prefix, 'no-results', '#catalogo')
        await both(async page => {
          await reset(page).click()
          assert.equal(await focus(page), 'cerca')
          assert.deepEqual(await cardIds(page), ids)
          await page.locator('[data-product="equilibria"] summary').click()
          await page.locator('[data-product="equilibria"]').getByText(/Scheda dimostrativa/).waitFor()
        })
        await capture(pair, prefix, 'details', '[data-product="equilibria"]')
        await both(async page => {
          await page.locator('[data-product="equilibria"] summary').click()
          await page.evaluate(() => scrollTo(0, 0))
          await cart(page).press('Enter')
          await drawer(page).getByRole('heading', { name: 'Il tuo carrello è vuoto' }).waitFor()
          assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Chiudi carrello')
        })
        await capture(pair, prefix, 'cart-empty', null)
        await both(async page => {
          await page.keyboard.press('Shift+Tab')
          assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Continua a esplorare')
          await page.keyboard.press('Escape')
          await drawer(page).waitFor({ state: 'hidden' })
          assert.equal(await cart(page).evaluate(el => document.activeElement === el), true)
          await add(page, 'Equilibria').click()
          await add(page, 'Equilibria').click()
          await add(page, 'Neurovia').click()
          await page.getByRole('button', { name: 'Apri carrello, 3 articoli' }).waitFor()
          await page.evaluate(() => { history.scrollRestoration = 'manual' })
          await page.reload()
          await page.getByRole('button', { name: 'Apri carrello, 3 articoli' }).click()
          await drawer(page).getByText('494,00 €').waitFor()
          await loadImages(page)
          await page.evaluate(() => scrollTo(0, 0))
          await page.waitForFunction(() => scrollY === 0)
        })
        await capture(pair, prefix, 'cart-filled', null)
        await both(async page => {
          await drawer(page).getByRole('button', { name: 'Aumenta quantità di Equilibria' }).click()
          await drawer(page).getByText('643,00 €').waitFor()
          await drawer(page).getByRole('button', { name: 'Diminuisci quantità di Equilibria' }).click()
          await drawer(page).getByRole('button', { name: 'Rimuovi Neurovia' }).click()
          await drawer(page).getByText('298,00 €', { exact: true }).last().waitFor()
          await page.mouse.click(3, 400)
          await drawer(page).waitFor({ state: 'hidden' })
          assert.equal(await cart(page).evaluate(el => document.activeElement === el), true)
          await submit(page).click()
          assert.equal(await focus(page), 'contact-name')
          assert.equal(await page.locator('[aria-invalid="true"]').count(), 3)
        })
        await capture(pair, prefix, 'form-errors', '#contatti')
        await both(async page => {
          await page.locator('#contact-name').fill('Mario Rossi')
          await page.locator('#contact-email').fill('mario@example.it')
          await page.locator('#contact-message').fill('Messaggio dimostrativo di prova.')
          await submit(page).click()
          await page.getByText('Nessun messaggio è stato inviato.', { exact: true }).filter({ visible: true }).waitFor()
          assert.equal(await focus(page), 'contact-success')
        })
        await capture(pair, prefix, 'form-success', '#contatti')

        assert.deepEqual(errors, [[], []])
        const measured = observations.filter(row => row.prefix === prefix && typeof row.changedPercent === 'number')
        for (const row of measured) {
          assert.deepEqual(row.sizeA, row.sizeB, JSON.stringify(row))
          assert.ok(row.changedPercent <= 0.5, JSON.stringify(row))
        }
        assert.deepEqual(a, b)
      } finally {
        await Promise.all(pair.map(page => page.close()))
      }
    })
  }
}

test('B keyboard, system appearance and WCAG scans', async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light', reducedMotion: 'reduce' })
  const page = await context.newPage()
  try {
    const errors = await ready(page, urls[1])
    assert.equal(await page.getByRole('radio', { name: 'Sistema' }).isChecked(), true)
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('html[data-theme="dark"]').waitFor()
    await page.getByRole('radio', { name: 'Scuro' }).focus()
    await page.keyboard.press('Space')
    await page.emulateMedia({ colorScheme: 'light' })
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
    await page.reload()
    await page.getByRole('radio', { name: 'Scuro', checked: true }).waitFor()
    await page.getByRole('radio', { name: 'Chiaro' }).focus()
    await page.keyboard.press('Space')
    await page.locator('html[data-theme="light"]').waitFor()

    const other = await context.newPage()
    await ready(other, urls[1])
    await page.getByRole('radio', { name: 'Scuro' }).check()
    await other.locator('html[data-theme="dark"]').waitFor()
    await page.addScriptTag({ path: fileURLToPath(new URL('../node_modules/axe-core/axe.min.js', import.meta.url)) })
    const scan = (selector = null) => page.evaluate(async ({ tags, selector }) => {
      const context = selector ?? document
      return (await window.axe.run(context, { runOnly: { type: 'tag', values: tags } })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target }) => target) }))
    }, { tags, selector })
    for (const name of ['Chiaro', 'Scuro']) {
      await page.getByRole('radio', { name }).check()
      assert.deepEqual(await scan(), [])
      await cart(page).click()
      assert.deepEqual(await scan('#cart-drawer'), [])
      await page.keyboard.press('Escape')
    }
    assert.deepEqual(errors, [])
  } finally {
    await context.close()
  }
})

test('B navigation, filter independence and responsive boundaries', async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 900 }, reducedMotion: 'reduce' })
  try {
    const errors = await ready(page, urls[1])
    await mobileMenu(page).press('Enter')
    await page.getByRole('navigation', { name: 'Principale' }).getByRole('link', { name: 'Formazione' }).press('Enter')
    await page.waitForFunction(() => document.activeElement.id === 'catalogo')
    assert.deepEqual(await cardIds(page), ids.slice(-2))
    await page.locator('#cerca').fill('NÉURO')
    assert.deepEqual(await cardIds(page), [])
    await category(page, 'Tutti').click()
    assert.deepEqual(await cardIds(page), ['neurovia'])
    await category(page, 'Clinica e Neuropsicologia').click()
    await page.getByRole('button', { name: 'Cancella ricerca' }).click()
    assert.equal(await focus(page), 'cerca')
    assert.deepEqual(await cardIds(page), ['equilibria', 'neurovia'])
    await reset(page).click()
    for (const width of [320, 639, 640, 767, 768, 1023, 1024, 1279, 1280, 1536]) {
      await page.setViewportSize({ width, height: 900 })
      assert.equal(await noOverflow(page), true, width + 'px')
      assert.equal(await mobileMenu(page).isVisible(), width < 1024)
      assert.equal(await page.locator('[aria-label="Prodotti del catalogo"]').evaluate(grid =>
        getComputedStyle(grid).gridTemplateColumns.split(' ').length), width < 768 ? 1 : width < 1024 ? 2 : 3)
    }
    assert.deepEqual(errors, [])
  } finally {
    await page.close()
  }
})

test('B applies saved Dark before the bundle and falls back to the OS without JavaScript', async () => {
  const saved = await browser.newContext({ colorScheme: 'light' })
  const disabled = await browser.newContext({ colorScheme: 'dark', javaScriptEnabled: false })
  try {
    await saved.addInitScript(() => localStorage.setItem('giunti.appearance.v1', 'dark'))
    await saved.route('**/build/app.js', route => route.abort())
    const painted = await saved.newPage()
    await painted.goto(urls[1])
    assert.equal(await painted.locator('html').getAttribute('data-theme'), 'dark')
    assert.equal(await painted.locator('#cerca').getAttribute('readonly'), '')
    assert.equal(await painted.locator('html').evaluate(el => getComputedStyle(el).colorScheme), 'dark')

    const fallback = await disabled.newPage()
    await fallback.goto(urls[1])
    assert.equal(await fallback.locator('html').getAttribute('data-theme'), null)
    assert.equal(await fallback.locator('html').evaluate(el => getComputedStyle(el).colorScheme), 'dark')
    assert.deepEqual(await cardIds(fallback), ids)
    assert.equal(await submit(fallback).isDisabled(), true)
  } finally {
    await Promise.all([saved.close(), disabled.close()])
  }
})

test('header links keep their targets aligned below the sticky header', async () => {
  for (const url of urls) {
    for (const width of [375, 768, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      try {
        await ready(page, url)
        const links = [['Test', 'catalogo'], ['Formazione', 'catalogo'], ['Risorse', 'guida'], ['Contatti', 'contatti']]
        for (const [name, id] of links) {
          if (width < 1024) await mobileMenu(page).click()
          const link = page.locator('header').getByRole('navigation', { name: 'Principale' }).getByRole('link', { name, exact: true })
          if (name === 'Risorse') await link.press('Enter')
          else await link.click()
          await page.waitForFunction(id => document.activeElement?.id === id, id, { timeout: 5000 }).catch(async error => {
            const [activeId, hash] = await page.evaluate(() => [document.activeElement?.id, location.hash])
            throw new Error(url + ' at ' + width + 'px: ' + name + ' focused ' + activeId + ' at ' + hash, { cause: error })
          })
          const { gap, focusVisible, outlineOffset } = await page.locator('#' + id).evaluate(target => ({
            gap: target.getBoundingClientRect().top - document.querySelector('header').getBoundingClientRect().bottom,
            focusVisible: target.matches(':focus-visible'),
            outlineOffset: parseFloat(getComputedStyle(target).outlineOffset),
          }))
          assert.ok(Math.abs(gap) <= 1, url + ' at ' + width + 'px: ' + name + ' left ' + gap + 'px')
          if (name === 'Risorse') {
            assert.ok(focusVisible, 'The keyboard target has visible focus')
            assert.ok(outlineOffset < 0, 'The header should not cover the focus ring')
          }
        }
        await page.locator('header').getByRole('link', { name: 'Cerca nel catalogo' }).click()
        await page.waitForFunction(() => document.activeElement?.id === 'cerca')
        const searchClearance = await page.locator('#cerca').evaluate(input => {
          const css = getComputedStyle(input)
          const gap = input.getBoundingClientRect().top - document.querySelector('header').getBoundingClientRect().bottom
          return gap - parseFloat(css.outlineWidth) - parseFloat(css.outlineOffset)
        })
        assert.ok(searchClearance >= -1, url + ' at ' + width + 'px: search focus clearance was ' + searchClearance + 'px')
      } finally {
        await page.close()
      }
    }
  }
})
