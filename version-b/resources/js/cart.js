const cartKey = 'giunti.cart.v1'
const maxQuantity = 99
const euros = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', useGrouping: 'always' })
const money = cents => euros.format(cents / 100)
const shortName = name => name.split(' — ')[0]

function readCart(value, products) {
  const seen = new Set()
  try {
    const data = JSON.parse(value)
    if (!Array.isArray(data)) return []
    return data.flatMap(row => {
      if (!row || !products.has(row.id) || seen.has(row.id) ||
          !Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > maxQuantity) return []
      seen.add(row.id)
      return [{ id: row.id, quantity: row.quantity }]
    })
  } catch {
    return []
  }
}

function cartTotals(entries, products) {
  return entries.reduce(({ units, cents }, { id, quantity }) => ({
    units: units + quantity,
    cents: cents + products.get(id).discountPriceCents * quantity,
  }), { units: 0, cents: 0 })
}

function initCart(closeMenu) {
  const $drawer = $('#cart-drawer')
  const dialog = $drawer[0]
  const $trigger = $('[data-cart-open]')
  const $close = $drawer.find('[data-cart-close]')
  const $lines = $drawer.find('[data-cart-lines]')
  const $notice = $('[data-cart-notice]')
  const $add = $('[data-cart-add]')
  const template = document.getElementById('cart-line').content
  const products = new Map(JSON.parse($('#cart-products').text()).map(product => [product.id, product]))
  const lines = new Map()
  const root = document.documentElement
  let entries = []
  let timer
  let oldGutter
  let backdropPress = false

  try {
    entries = readCart(window.localStorage.getItem(cartKey), products)
  } catch {
    // Keep an empty in-memory cart if storage is unavailable.
  }

  function lineFor(product) {
    if (lines.has(product.id)) return lines.get(product.id)
    const $line = $(template.firstElementChild.cloneNode(true))
    const name = shortName(product.name)
    $line.attr('data-cart-line', product.id)
    $line.find('img').attr('src', product.image)
    $line.find('[data-line-name]').text(product.name)
    $line.find('[data-line-format]').text(product.format)
    $line.find('[data-line-unit]').text(money(product.discountPriceCents) + ' per unità')
    $line.find('[data-line-controls]').attr('aria-label', 'Quantità di ' + name)
    $line.find('[data-line-action="decrease"]').attr('aria-label', 'Diminuisci quantità di ' + name)
    $line.find('[data-line-action="add"]').attr('aria-label', 'Aumenta quantità di ' + name)
    $line.find('[data-line-action="remove"]').attr('aria-label', 'Rimuovi ' + name)
    lines.set(product.id, $line)
    $lines.append($line)
    return $line
  }

  function setLimit($button, atLimit) {
    if (atLimit) $button.attr('aria-disabled', 'true')
    else $button.removeAttr('aria-disabled')
  }

  function render() {
    const counts = new Map(entries.map(entry => [entry.id, entry.quantity]))
    const { units, cents } = cartTotals(entries, products)
    const count = units + (units === 1 ? ' articolo' : ' articoli')
    $trigger.attr('aria-label', 'Apri carrello, ' + count)
    $trigger.find('[data-cart-badge]').text(units)
    $drawer.find('[data-cart-units]').text(count)
    $drawer.find('[data-cart-subtotal]').text(money(cents))
    $drawer.find('[data-cart-empty]').prop('hidden', units > 0)
    $drawer.find('[data-cart-clear]').prop('hidden', units === 0)
    $lines.prop('hidden', units === 0)

    for (const [id, $line] of lines) {
      if (counts.has(id)) continue
      $line.remove()
      lines.delete(id)
    }

    for (const { id, quantity } of entries) {
      const product = products.get(id)
      const $line = lineFor(product)
      $line.find('[data-line-count]').text(quantity)
      $line.find('[data-line-total]').text(money(product.discountPriceCents * quantity))
      setLimit($line.find('[data-line-action="add"]'), quantity >= maxQuantity)
    }

    $add.each(function () {
      const id = this.dataset.cartAdd
      const name = shortName(products.get(id).name)
      const atLimit = counts.get(id) >= maxQuantity
      setLimit($(this), atLimit)
      $(this).attr('aria-label', atLimit ? 'Limite raggiunto per ' + name : 'Aggiungi ' + name + ' al carrello')
    })
  }

  function commit(message, toast = false) {
    if (products.size) {
      try { window.localStorage.setItem(cartKey, JSON.stringify(entries)) } catch {}
    }
    render()
    $drawer.find('[data-cart-status]').text(message)
    $notice.text(message)
    if (toast) {
      window.clearTimeout(timer)
      $notice.removeClass('visually-hidden').addClass('cart-notice--visible')
      timer = window.setTimeout(() => $notice.removeClass('cart-notice--visible').addClass('visually-hidden'), 2200)
    }
  }

  function change(action, id, toast) {
    const entry = entries.find(row => row.id === id)
    const previous = entry?.quantity ?? 0
    let quantity = 0
    if (action === 'add') quantity = Math.min(previous + 1, maxQuantity)
    if (action === 'decrease') quantity = Math.max(previous - 1, 0)
    if (quantity === previous) return
    if (quantity === 0) {
      $close.trigger('focus')
      entries = entries.filter(row => row.id !== id)
    } else if (entry) {
      entry.quantity = quantity
    } else {
      entries.push({ id, quantity })
    }
    const name = shortName(products.get(id).name)
    commit(quantity ? name + ': ' + quantity + ' unità nel carrello.' : name + ' rimosso dal carrello.', toast)
  }

  function close(explore = false) {
    if (!dialog.open) return
    dialog.close()
    root.style.scrollbarGutter = oldGutter
    $trigger.attr('aria-expanded', 'false')
    if (explore) {
      const catalog = document.getElementById('catalogo')
      catalog.focus({ preventScroll: true })
      catalog.scrollIntoView({ block: 'start' })
    } else {
      $trigger[0].focus({ preventScroll: true })
    }
  }

  $trigger.prop('disabled', false).on('click.giuntiCart', () => {
    if (dialog.open) return
    oldGutter = root.style.scrollbarGutter
    if (root.clientWidth < window.innerWidth) root.style.scrollbarGutter = 'stable'
    closeMenu()
    dialog.showModal()
    $close.trigger('focus')
    $trigger.attr('aria-expanded', 'true')
  })
  $add.prop('disabled', false).on('click.giuntiCart', function () {
    change('add', this.dataset.cartAdd, true)
  })

  $drawer.on('cancel.giuntiCart', event => {
    event.preventDefault()
    close()
  }).on('keydown.giuntiCart', event => {
    if (event.key === 'Escape') event.stopPropagation()
    if (event.key !== 'Tab') return
    const buttons = $drawer.find('button:visible:not(:disabled)').get()
    const first = buttons[0]
    const last = buttons.at(-1)
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault()
      const target = event.shiftKey ? last : first
      target.focus()
    }
  }).on('pointerdown.giuntiCart', event => {
    backdropPress = event.target === dialog
  }).on('click.giuntiCart', event => {
    if (backdropPress && event.target === dialog) close()
    backdropPress = false
  }).on('click.giuntiCart', '[data-cart-close], [data-cart-dismiss]', () => close())
    .on('click.giuntiCart', '[data-cart-explore]', () => close(true))
    .on('click.giuntiCart', '[data-line-action]', function () {
      change(this.dataset.lineAction, this.closest('[data-cart-line]').dataset.cartLine)
    }).on('click.giuntiCart', '[data-cart-clear]', () => {
      $close.trigger('focus')
      entries = []
      commit('Carrello svuotato.')
    })

  render()
}
