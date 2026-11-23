import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { chromium } from 'playwright-core'

const require = createRequire(import.meta.url)
const url = process.env.APP_URL ?? 'http://127.0.0.1:3000'
const preferenceKey = 'giunti.appearance.v1'
const screenshots = process.env.SCREENSHOT_DIR
const catalogProducts = JSON.parse(await readFile(new URL('../../specs/products.json', import.meta.url), 'utf8'))
let browser

before(async () => {
  browser = await chromium.launch({
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' })
  })
  if (screenshots) await mkdir(screenshots, { recursive: true })
})

after(async () => browser?.close())

async function newPage(options = {}) {
  const page = await browser.newPage({ reducedMotion: 'reduce', colorScheme: 'light', ...options })
  await page.goto(url)
  return page
}

const countCards = (page) => page.locator('[data-product]').count()
const waitForTheme = (page, theme) => page.locator('html[data-theme="' + theme + '"]').waitFor({ state: 'attached' })

for (const [width, columns] of [[375, 1], [768, 2], [1280, 3]]) {
  for (const scheme of ['light', 'dark']) {
    test(width + 'px ' + scheme + ': grid, footer, reflow, assets and axe WCAG AA', async () => {
      const page = await newPage({ viewport: { width, height: 900 }, colorScheme: scheme })
      try {
        assert.equal(await page.locator('html').getAttribute('lang'), 'it')
        assert.equal(await countCards(page), 8)
        const grid = page.getByRole('list', { name: 'Prodotti del catalogo' })
        assert.equal(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length), columns)
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
        await waitForTheme(page, scheme)
        const headingStyle = await page.getByRole('heading', { level: 1 }).evaluate((element) => {
          const { color, fontSize } = getComputedStyle(element)
          return { color, fontSize, bodyColor: getComputedStyle(document.body).color }
        })
        assert.equal(headingStyle.color, headingStyle.bodyColor)
        assert.equal(headingStyle.fontSize, ({ 375: '40px', 768: '48px', 1280: '64px' })[width])

        const footer = page.getByRole('contentinfo')
        assert.equal(await footer.getByRole('img', { name: 'Giunti Psychometrics', exact: true }).getAttribute('src'), '/giunti-psychometrics.png')
        const nav = footer.getByRole('navigation', { name: 'Navigazione a piè di pagina' })
        assert.equal(await nav.getByRole('link').count(), 4)
        for (const [name, target] of [['Test', '#catalogo'], ['Formazione', '#catalogo'], ['Risorse', '#guida'], ['Contatti', '#contatti']]) {
          assert.equal(await nav.getByRole('link', { name, exact: true }).getAttribute('href'), target)
        }
        await nav.getByRole('link', { name: 'Test', exact: true }).focus()
        await page.keyboard.press('Tab')
        assert.equal(await nav.getByRole('link', { name: 'Formazione', exact: true }).evaluate(link =>
          document.activeElement === link && link.matches(':focus-visible') && getComputedStyle(link).outlineStyle !== 'none'
        ), true)

        const social = footer.getByRole('list', { name: 'Social (segnaposto dimostrativi)' })
        assert.equal(await social.getByRole('img').count(), 4)
        for (const name of ['Instagram', 'LinkedIn', 'YouTube', 'Facebook']) {
          assert.equal(await social.getByRole('img', { name, exact: true }).isVisible(), true)
        }
        assert.equal(await social.locator('a, button, [tabindex]').count(), 0)
        const copyright = footer.getByText('© 2026 Giunti Psychometrics. Tutti i diritti riservati.', { exact: true })
        const copyrightBox = await copyright.boundingBox()
        const socialBox = await social.boundingBox()
        assert.ok(copyrightBox && socialBox &&
          (copyrightBox.y + copyrightBox.height <= socialBox.y || copyrightBox.x + copyrightBox.width <= socialBox.x))

        for (const image of await page.locator('img').all()) {
          await image.scrollIntoViewIfNeeded()
          assert.ok(await image.evaluate(async (element) => {
            await element.decode()
            return element.naturalWidth > 0
          }))
        }
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.evaluate(() => document.fonts.ready)
        if (screenshots) await page.screenshot({ path: path.join(screenshots, 'version-a-' + width + '-' + scheme + '.png'), fullPage: true })

        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
        const findings = await page.evaluate(async () => {
          const result = await window.axe.run({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
          return result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target }) => target) }))
        })
        assert.deepEqual(findings, [])
      } finally {
        await page.close()
      }
    })
  }
}

test('mobile menu, search, category navigation, resets and product disclosure', async () => {
  const page = await newPage({ viewport: { width: 375, height: 850 } })
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  try {
    const menu = page.getByRole('button', { name: 'Apri menu' })
    await menu.focus()
    await menu.press('Enter')
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Test')
    await page.keyboard.press('Escape')
    assert.equal(await menu.evaluate((element) => document.activeElement === element), true)
    await menu.click()
    await page.getByRole('navigation', { name: 'Principale' }).getByRole('link', { name: 'Formazione' }).click()
    await page.getByRole('status').getByText('2', { exact: true }).waitFor()
    assert.equal(await countCards(page), 2)
    assert.equal(await menu.getAttribute('aria-expanded'), 'false')

    await page.getByRole('link', { name: 'Cerca nel catalogo' }).click()
    const search = page.getByRole('searchbox')
    await page.waitForFunction(() => document.activeElement.id === 'cerca')
    await search.fill(' ÉQUILÍBRIA ')
    await page.getByRole('heading', { name: 'Nessun risultato trovato' }).waitFor()
    await page.getByRole('button', { name: 'Tutti', exact: true }).click()
    assert.equal(await countCards(page), 1)
    const details = page.locator('[data-product="equilibria"] summary')
    await details.press('Enter')
    await page.getByText('Il prodotto non è in vendita.', { exact: false }).waitFor()
    await page.getByRole('button', { name: 'Clinica e Neuropsicologia' }).click()
    await page.getByRole('button', { name: 'Cancella ricerca' }).click()
    assert.equal(await countCards(page), 2)
    assert.equal(await search.evaluate((element) => document.activeElement === element), true)
    await page.getByRole('button', { name: 'Cancella filtri' }).click()
    assert.equal(await countCards(page), 8)
    assert.deepEqual(pageErrors, [])
  } finally {
    await page.close()
  }
})

for (const colorScheme of ['light', 'dark']) {
  test('catalog search reconciles consecutive and rapid edits in ' + colorScheme, async () => {
    const page = await browser.newPage({ reducedMotion: 'reduce', colorScheme })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error' || (message.type() === 'warning' && /react|hydrat|unique.*key/i.test(message.text()))) {
        errors.push(message.text())
      }
    })

    try {
      await page.goto(url)
      await waitForTheme(page, colorScheme)
      await page.locator('#cerca:not([readonly])').waitFor()
      const catalog = page.locator('#catalogo')
      const search = catalog.getByRole('searchbox')
      const allIds = catalogProducts.map(({ id }) => id)
      const clinicalIds = catalogProducts.filter(({ categoryId }) => categoryId === 'clinica').map(({ id }) => id)
      const equilibria = catalog.locator('[data-product="equilibria"]')
      const originalCard = await equilibria.elementHandle()

      async function expectProducts(expected) {
        await page.waitForFunction(ids => {
          const actual = Array.from(document.querySelectorAll('#catalogo [data-product]'), card => card.dataset.product)
          return actual.length === ids.length && actual.every((id, index) => id === ids[index])
        }, expected)
        assert.equal(await catalog.getByRole('status').locator('strong').innerText(), String(expected.length))
      }

      await expectProducts(allIds)
      await search.pressSequentially('Equ')
      await expectProducts(['equilibria'])
      await search.pressSequentially('ilibria')
      assert.equal(await search.inputValue(), 'Equilibria')
      await catalog.getByRole('button', { name: 'Clinica e Neuropsicologia', exact: true }).click()
      await expectProducts(['equilibria'])
      assert.equal(await equilibria.evaluate((current, previous) => current === previous, originalCard), true)
      await originalCard.dispose()

      await catalog.getByRole('button', { name: 'Formazione', exact: true }).click()
      await expectProducts([])
      await catalog.getByRole('heading', { name: 'Nessun risultato trovato' }).waitFor()
      assert.equal(await search.inputValue(), 'Equilibria')
      await catalog.getByRole('button', { name: 'Tutti', exact: true }).click()
      await search.fill('  ÉQUILI\u0301BRIA  ')
      await expectProducts(['equilibria'])

      await catalog.getByRole('button', { name: 'Clinica e Neuropsicologia', exact: true }).click()
      await catalog.getByRole('button', { name: 'Cancella ricerca', exact: true }).click()
      assert.equal(await search.inputValue(), '')
      await expectProducts(clinicalIds)
      for (const query of ['Neurovia', 'nessun prodotto', 'Equilibria']) await search.fill(query)
      await expectProducts(['equilibria'])
      await catalog.getByRole('button', { name: 'Cancella filtri', exact: true }).click()
      assert.equal(await search.inputValue(), '')
      assert.equal(await catalog.getByRole('button', { name: 'Tutti', exact: true }).getAttribute('aria-pressed'), 'true')
      await expectProducts(allIds)
      assert.deepEqual(errors, [])
    } finally {
      await page.close()
    }
  })
}

for (const width of [375, 1280]) {
  for (const colorScheme of ['light', 'dark']) {
    test('Accedi stays open on clicks and closes by keyboard at ' + width + 'px in ' + colorScheme, async () => {
      const page = await newPage({ viewport: { width, height: 900 }, colorScheme })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text())
      })
      const trigger = page.locator('summary[aria-label="Accedi (demo)"]')
      const notice = page.getByText('Accesso dimostrativo. Questa pagina non prevede account.', { exact: true })
      try {
        page.setDefaultTimeout(5000)
        await page.locator('#cerca:not([readonly])').waitFor({ state: 'attached' })
        if (width === 375) await page.getByRole('button', { name: 'Apri menu' }).click()
        await waitForTheme(page, colorScheme)
        await trigger.click()
        const text = await notice.evaluate(element => {
          const range = document.createRange()
          range.selectNodeContents(element)
          const { left, top, width, height } = range.getClientRects()[0]
          return { x: left + width / 2, y: top + height / 2 }
        })
        await page.mouse.click(text.x, text.y)
        assert.equal(await notice.isVisible(), true, 'clicking the text keeps the notice open')
        await notice.click({ position: { x: 4, y: 4 } })
        assert.equal(await notice.isVisible(), true, 'clicking the padding keeps the notice open')
        await page.keyboard.press('Escape')
        await notice.waitFor({ state: 'hidden' })
        assert.equal(await trigger.evaluate(element => document.activeElement === element), true)

        await trigger.press('Enter')
        await notice.waitFor()
        await trigger.press('Space')
        await notice.waitFor({ state: 'hidden' })
        await trigger.press('Enter')
        await notice.waitFor()
        await trigger.evaluate(element => element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: window })))
        await notice.waitFor({ state: 'hidden' })
        assert.equal(page.url(), new URL(url).href)
        assert.deepEqual(errors, [])
      } finally {
        await page.close()
      }
    })
  }
}

test('contact errors focus the first field, submit remains local and restart restores focus', async () => {
  const page = await newPage()
  const outgoing = []
  page.on('request', (request) => {
    if (request.isNavigationRequest() || request.method() !== 'GET') outgoing.push(request.url())
  })
  try {
    const button = page.getByRole('button', { name: 'Simula invio' })
    await button.click()
    await page.waitForFunction(() => document.activeElement.id === 'contact-name')
    const name = page.getByRole('textbox', { name: 'Nome' })
    assert.equal(await name.getAttribute('aria-describedby'), 'contact-name-errore')
    await name.fill('Ada')
    await button.click()
    await page.waitForFunction(() => document.activeElement.id === 'contact-email')
    await page.getByRole('textbox', { name: 'Email' }).fill('ada@example.it')
    await button.click()
    await page.waitForFunction(() => document.activeElement.id === 'contact-message')
    await page.getByRole('textbox', { name: 'Messaggio' }).fill('Desidero informazioni.')
    await button.click()
    await page.waitForFunction(() => document.activeElement.id === 'contact-success')
    await page.getByText('Nessun messaggio è stato inviato.', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Prova di nuovo' }).click()
    await page.waitForFunction(() => document.activeElement.id === 'contact-name')
    assert.equal(await name.inputValue(), '')
    assert.deepEqual(outgoing, [])
  } finally {
    await page.close()
  }
})

for (const [width, scheme] of [[375, 'light'], [375, 'dark'], [768, 'light'], [768, 'dark'], [1280, 'light'], [1280, 'dark']]) {
  test('card metadata and cart drawer fit at ' + width + 'px in ' + scheme, async () => {
    const page = await newPage({ viewport: { width, height: 680 }, colorScheme: scheme })
    try {
      for (const id of ['sinergia', 'psicologia-organizzazioni']) {
        const card = page.locator('[data-product="' + id + '"]')
        const rows = await card.getByRole('list', { name: 'Informazioni sul prodotto' }).getByRole('listitem').evaluateAll(items =>
          items.map(item => {
            const icon = item.querySelector('svg').getBoundingClientRect()
            const text = item.querySelector('p').getBoundingClientRect()
            const label = item.querySelector('strong').getBoundingClientRect()
            const value = item.querySelector('p > span').getClientRects()[0]
            return { iconLeft: icon.x, textLeft: text.x, labelY: label.y, valueY: value.y, valueX: value.x, labelEnd: label.right }
          }))
        assert.equal(rows.length, 2)
        assert.equal(rows[0].iconLeft, rows[1].iconLeft)
        assert.equal(rows[0].textLeft, rows[1].textLeft)
        for (const row of rows) assert.ok(row.valueY === row.labelY ? row.valueX >= row.labelEnd : row.valueY > row.labelY)
        const cta = await card.locator('summary').boundingBox()
        const add = await card.getByRole('button', { name: /^Aggiungi / }).boundingBox()
        assert.ok(cta && add && cta.y === add.y && cta.height === add.height && add.width === add.height && cta.x + cta.width < add.x)
        if (screenshots) await card.screenshot({ path: path.join(screenshots, 'card-' + id + '-' + width + '-' + scheme + '.png') })
      }

      const scrollCase = width === 768 && scheme === 'dark'
      if (scrollCase) {
        for (const button of await page.getByRole('button', { name: /^Aggiungi / }).all()) await button.click()
      } else {
        await page.getByRole('button', { name: 'Aggiungi Equilibria al carrello' }).click()
      }
      const trigger = page.getByRole('button', { name: /^Apri carrello/ })
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: 'Il tuo carrello' })
      const box = await dialog.boundingBox()
      assert.ok(box && box.x > 0 && box.x + box.width === width && box.height === 680 && box.width <= 460)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), 'hidden')
      if (scrollCase) {
        const scrolled = await dialog.getByRole('list', { name: 'Prodotti nel carrello' }).evaluate(list => {
          const panel = list.parentElement
          panel.scrollTop = 190
          return panel.scrollHeight > panel.clientHeight && panel.scrollTop > 0
        })
        assert.equal(scrolled, true)
        const footerButton = await dialog.getByRole('button', { name: 'Continua a esplorare' }).boundingBox()
        assert.ok(footerButton && footerButton.y >= 0 && footerButton.y + footerButton.height <= 680)
      }
      if (screenshots) await page.screenshot({ path: path.join(screenshots, 'cart-' + width + '-' + scheme + '.png') })
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
      const violations = await page.evaluate(async () => {
        const results = await window.axe.run('#cart-drawer', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
        return results.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target }) => target) }))
      })
      assert.deepEqual(violations, [])
      if (width === 1280 && scheme === 'light') {
        const oldBackground = await dialog.evaluate(el => getComputedStyle(el).backgroundColor)
        await page.emulateMedia({ colorScheme: 'dark' })
        await waitForTheme(page, 'dark')
        assert.notEqual(await dialog.evaluate(el => getComputedStyle(el).backgroundColor), oldBackground)
      }
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
    } finally {
      await page.close()
    }
  })
}

test('cart persists quantities, computes totals and handles focus and all dismissal paths', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const errors = []
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(url)
    const trigger = page.getByRole('button', { name: /^Apri carrello/ })
    const dialog = page.getByRole('dialog', { name: 'Il tuo carrello' })
    const close = dialog.getByRole('button', { name: 'Chiudi carrello' })
    const add = page.getByRole('button', { name: 'Aggiungi Equilibria al carrello' })
    await add.click()
    await add.click()
    await page.getByRole('status').filter({ hasText: 'Equilibria: 2 unità nel carrello.' }).waitFor()
    await page.getByRole('button', { name: 'Aggiungi Neurovia al carrello' }).click()
    assert.equal(await dialog.count(), 0)
    assert.equal(await trigger.getAttribute('aria-label'), 'Apri carrello, 3 articoli')
    await page.reload()
    await page.getByRole('button', { name: 'Apri carrello, 3 articoli' }).waitFor()
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('giunti.cart.v1'))), [
      { id: 'equilibria', quantity: 2 }, { id: 'neurovia', quantity: 1 }
    ])

    await trigger.press('Enter')
    await dialog.waitFor()
    assert.equal(await dialog.getAttribute('aria-modal'), 'true')
    assert.equal(await close.evaluate(button => document.activeElement === button), true)
    assert.equal(await dialog.getByText('494,00 €', { exact: true }).isVisible(), true)
    assert.equal(await dialog.getByText('Totale prodotto: 298,00 €', { exact: true }).isVisible(), true)
    await page.keyboard.press('Shift+Tab')
    const clear = dialog.getByRole('button', { name: 'Svuota carrello' })
    assert.equal(await clear.evaluate(button => document.activeElement === button), true)
    await page.keyboard.press('Tab')
    assert.equal(await close.evaluate(button => document.activeElement === button), true)
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press('Tab')
      assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true)
    }

    await dialog.getByRole('button', { name: 'Aumenta quantità di Equilibria' }).click()
    await dialog.getByText('643,00 €', { exact: true }).waitFor()
    await dialog.getByRole('button', { name: 'Diminuisci quantità di Equilibria' }).click()
    await dialog.getByText('494,00 €', { exact: true }).waitFor()
    await dialog.getByRole('button', { name: 'Rimuovi Neurovia' }).click()
    await dialog.getByText('2 articoli', { exact: true }).waitFor()
    await dialog.getByRole('button', { name: 'Diminuisci quantità di Equilibria' }).click()
    await dialog.getByRole('button', { name: 'Diminuisci quantità di Equilibria' }).click()
    await dialog.getByRole('heading', { name: 'Il tuo carrello è vuoto' }).waitFor()
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(await trigger.evaluate(button => document.activeElement === button), true)

    await trigger.click()
    await dialog.waitFor()
    await page.mouse.click(5, 5)
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(await trigger.evaluate(button => document.activeElement === button), true)
    await trigger.click()
    await close.click()
    await dialog.waitFor({ state: 'hidden' })
    await trigger.click()
    await dialog.getByRole('button', { name: 'Continua a esplorare' }).click()
    await dialog.waitFor({ state: 'hidden' })
    await trigger.click()
    await dialog.getByRole('button', { name: 'Esplora il catalogo' }).click()
    await page.waitForFunction(() => document.activeElement.id === 'catalogo')
    await add.click()
    await trigger.click()
    await clear.click()
    await dialog.getByRole('heading', { name: 'Il tuo carrello è vuoto' }).waitFor()
    assert.deepEqual(errors, [])
  } finally {
    await page.close()
  }
})

test('theme follows OS only in System, persists, and syncs same-origin tabs', async () => {
  const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' })
  const page = await context.newPage()
  await page.goto(url)
  const preference = page.getByRole('group', { name: 'Aspetto' })
  const light = preference.getByRole('radio', { name: 'Chiaro', exact: true })
  const dark = preference.getByRole('radio', { name: 'Scuro', exact: true })
  const system = preference.getByRole('radio', { name: 'Sistema', exact: true })
  try {
    await page.getByRole('searchbox').fill('equilibria')
    await page.getByRole('textbox', { name: 'Nome' }).fill('Ada')
    assert.equal(await preference.getByRole('radio').count(), 3)
    assert.equal(await system.isChecked(), true)
    await system.press('ArrowRight')
    await waitForTheme(page, 'light')
    assert.equal(await light.isChecked(), true)
    await page.keyboard.press('ArrowRight')
    await waitForTheme(page, 'dark')
    assert.equal(await dark.isChecked(), true)
    assert.equal(await dark.evaluate(element => document.activeElement === element &&
      getComputedStyle(element.nextElementSibling).outlineStyle === 'solid'), true)
    assert.equal(await page.getByRole('searchbox').inputValue(), 'equilibria')
    assert.equal(await page.getByRole('textbox', { name: 'Nome' }).inputValue(), 'Ada')
    await page.reload()
    await waitForTheme(page, 'dark')
    await page.getByRole('radio', { name: 'Scuro', exact: true, checked: true }).waitFor()

    const secondPage = await context.newPage()
    await secondPage.goto(url)
    await secondPage.getByRole('group', { name: 'Aspetto' }).locator('label[data-preference="light"]').click()
    await waitForTheme(page, 'light')
    await page.emulateMedia({ colorScheme: 'dark' })
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
    await secondPage.evaluate((key) => localStorage.removeItem(key), preferenceKey)
    await waitForTheme(page, 'dark')
    await page.getByRole('radio', { name: 'Sistema', exact: true, checked: true }).waitFor()
    await page.emulateMedia({ colorScheme: 'light' })
    await waitForTheme(page, 'light')
  } finally {
    await context.close()
  }
})

test('the paint uses stored Dark before hydration, and disabled JavaScript follows the system', async () => {
  const page = await browser.newPage({ colorScheme: 'light' })
  try {
    await page.addInitScript((key) => localStorage.setItem(key, 'dark'), preferenceKey)
    await page.route('**/_next/**', (route) =>
      route.request().resourceType() === 'script' ? route.abort() : route.continue())
    await page.goto(url)
    await waitForTheme(page, 'dark')
    const appearance = page.getByRole('group', { name: 'Aspetto' })
    assert.equal(await appearance.getByRole('radio', { name: 'Scuro', exact: true }).isDisabled(), true)
    const darkBorder = await appearance.locator('[data-preference="dark"] .appearance-icon').evaluate(el => getComputedStyle(el).borderColor)
    const systemBorder = await appearance.locator('[data-preference="system"] .appearance-icon').evaluate(el => getComputedStyle(el).borderColor)
    assert.notEqual(darkBorder, systemBorder)
    assert.equal(await page.locator('html').evaluate((element) => getComputedStyle(element).colorScheme), 'dark')
  } finally {
    await page.close()
  }

  const noScript = await newPage({ javaScriptEnabled: false, colorScheme: 'dark' })
  try {
    assert.equal(await countCards(noScript), 8)
    assert.equal(await noScript.locator('html').evaluate((element) => getComputedStyle(element).colorScheme), 'dark')
    assert.equal(await noScript.getByRole('button', { name: 'Simula invio' }).isDisabled(), true)
  } finally {
    await noScript.close()
  }
})

test('320px reflow, reduced motion and blocked storage', async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 720 }, reducedMotion: 'reduce' })
  try {
    await page.addInitScript(() => {
      Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('Storage blocked', 'SecurityError') }
    })
    await page.goto(url)
    await page.getByRole('button', { name: 'Apri menu' }).click()
    await page.getByRole('group', { name: 'Aspetto' }).locator('label[data-preference="dark"]').click()
    await waitForTheme(page, 'dark')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 320)
    assert.equal(await page.locator('html').evaluate((element) => getComputedStyle(element).scrollBehavior), 'auto')
    await page.getByRole('button', { name: 'Chiudi menu' }).click()
    await page.getByRole('button', { name: 'Aggiungi Equilibria al carrello' }).click()
    await page.getByRole('button', { name: 'Apri carrello, 1 articolo' }).click()
    const cart = page.getByRole('dialog', { name: 'Il tuo carrello' })
    assert.equal(await cart.getByText('149,00 €', { exact: true }).isVisible(), true)
    assert.equal(await cart.evaluate(el => getComputedStyle(el).animationDuration), '0s')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 320)
  } finally {
    await page.close()
  }
})
