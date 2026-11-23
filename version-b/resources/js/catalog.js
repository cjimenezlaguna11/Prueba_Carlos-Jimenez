function normalizeName(value) {
  return value.trim().normalize('NFD').toLocaleLowerCase('it-IT').replace(/\p{M}/gu, '')
}

function initCatalog() {
  const $catalog = $('[data-catalog]')
  const $input = $catalog.find('input[type="search"]')
  const $filters = $catalog.find('[data-category]')
  const $items = $catalog.find('[data-product]')
  const items = $items.map((_, item) => ({
    element: item,
    name: normalizeName(item.dataset.name),
    category: item.dataset.productCategory,
  })).get()
  let category = 'tutti'

  function render() {
    if (!$input.length) return
    const query = $input.val()
    const term = normalizeName(query)
    let count = 0

    for (const item of items) {
      const visible = (category === 'tutti' || item.category === category) && item.name.includes(term)
      // In A a filtered-out card unmounts; its disclosure starts closed on return.
      if (!visible && !item.element.hidden) item.element.querySelector('details').open = false
      item.element.hidden = !visible
      count += Number(visible)
    }

    const $selected = $filters.filter((_, button) => button.dataset.category === category)
    $filters.attr('aria-pressed', 'false')
    $selected.attr('aria-pressed', 'true')
    $catalog.find('[data-result-count]').text(count)
    $catalog.find('[data-result-label]').text(count === 1 ? 'prodotto disponibile' : 'prodotti disponibili')
    $catalog.find('[data-result-category]').text(category === 'tutti' ? '' : ' in ' + $selected.attr('data-category-label'))
    $catalog.find('[data-clear-search]').prop('hidden', !query)
    $catalog.find('[data-clear-results]').prop('hidden', count === 0 || (!query && category === 'tutti'))
    $catalog.find('.catalog__grid').prop('hidden', count === 0)
    $catalog.find('[data-empty-results]').prop('hidden', count !== 0)
  }

  function setCategory(value) {
    category = value
    render()
  }

  function clearSearch() {
    $input.val('')
    render()
    $input.trigger('focus')
  }

  $input.prop('readOnly', false).on('input.giuntiCatalog', render)
  $filters.prop('disabled', false)
  $catalog.on('click.giuntiCatalog', '[data-category]', function () {
    setCategory(this.dataset.category)
  }).on('click.giuntiCatalog', '[data-clear-search]', clearSearch)
    .on('click.giuntiCatalog', '[data-clear-filters]', () => {
      category = 'tutti'
      clearSearch()
    })

  return setCategory
}
