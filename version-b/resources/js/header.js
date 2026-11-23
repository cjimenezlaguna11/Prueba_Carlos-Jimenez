function initHeader(setCategory) {
  const $header = $('[data-header]')
  const $toggle = $header.find('[data-menu-toggle]')
  const $panel = $('#menu-principale')
  const $login = $header.find('[data-login]')
  const $appearance = $('[data-appearance]')

  function setMenu(open) {
    $toggle.attr({ 'aria-expanded': String(open), 'aria-label': open ? 'Chiudi menu' : 'Apri menu' })
    $toggle.find('[data-menu-icon]').prop('hidden', open)
    $toggle.find('[data-close-icon]').prop('hidden', !open)
    $panel.toggleClass('site-header__panel--open', open)
    if (!open) $login.prop('open', false)
  }

  const closeMenu = () => setMenu(false)
  $toggle.prop('disabled', false).on('click.giuntiHeader', () => setMenu($toggle.attr('aria-expanded') !== 'true'))
  $header.on('keydown.giuntiHeader', event => {
    if (event.key !== 'Escape') return
    if ($login.prop('open')) {
      $login.prop('open', false).find('summary').trigger('focus')
    } else if ($toggle.attr('aria-expanded') === 'true') {
      closeMenu()
      $toggle.trigger('focus')
    }
  }).on('focusout.giuntiHeader', event => {
    if (!$header[0].contains(event.relatedTarget)) closeMenu()
  })

  $(document).on('click.giuntiHeader', '[data-section-link]', function (event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const category = this.dataset.navCategory
    if (category) setCategory(category)
    if ($header[0].contains(this)) closeMenu()
    const target = this.hash.slice(1)
    requestAnimationFrame(() => document.getElementById(target)?.focus({ preventScroll: true }))
  })

  const appearance = window.giuntiAppearance
  const $radios = $appearance.find('input[type="radio"]')
  function syncAppearance() {
    const value = appearance.get()
    $radios.each(function () { this.checked = this.value === value })
  }
  syncAppearance()
  appearance.subscribe(syncAppearance)
  $appearance.prop('disabled', false).on('change.giuntiHeader', 'input[type="radio"]', function () {
    appearance.set(this.value)
  })

  return closeMenu
}
