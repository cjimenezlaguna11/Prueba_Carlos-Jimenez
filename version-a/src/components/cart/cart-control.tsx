'use client'

import { useRef, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { useHydrated } from '@/lib/use-hydrated'
import { CartDrawer } from './cart-drawer'
import { useCart } from './cart-context'

export function CartControl({ onOpen }: { onOpen: () => void }) {
  const { units } = useCart()
  const hydrated = useHydrated()
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const oldGutter = useRef('')

  function openCart() {
    if (!dialog.current || dialog.current.open) return
    const root = document.documentElement
    oldGutter.current = root.style.scrollbarGutter
    if (root.clientWidth < window.innerWidth) root.style.scrollbarGutter = 'stable'
    onOpen()
    dialog.current.showModal()
    closeButton.current?.focus()
    setOpen(true)
  }

  function restoreFocus(explore: boolean) {
    document.documentElement.style.scrollbarGutter = oldGutter.current
    setOpen(false)
    if (explore) {
      const catalog = document.getElementById('catalogo')
      catalog?.focus({ preventScroll: true })
      catalog?.scrollIntoView({ block: 'start' })
    } else {
      trigger.current?.focus({ preventScroll: true })
    }
  }

  return (
    <>
      <button ref={trigger} type="button" disabled={!hydrated} className="icon-button relative"
        aria-label={'Apri carrello, ' + units + (units === 1 ? ' articolo' : ' articoli')}
        aria-haspopup="dialog" aria-controls="cart-drawer" aria-expanded={open} onClick={openCart}>
        <Icon name="cart" />
        <span aria-hidden="true" className="absolute top-0.5 right-0.5 grid min-h-5 min-w-5 place-items-center rounded-pill bg-(--ds-button-bg) px-1 text-xs leading-none font-bold text-(--ds-button-text) tabular-nums">{units}</span>
      </button>
      <CartDrawer dialogRef={dialog} closeRef={closeButton} onClose={restoreFocus} />
    </>
  )
}
