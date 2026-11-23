$(function () {
  const setCategory = initCatalog()
  const closeMenu = initHeader(setCategory)
  initCart(closeMenu)
  initContact()
})
