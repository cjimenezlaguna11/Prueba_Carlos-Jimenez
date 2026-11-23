'use client'

import Image from 'next/image'
import { useRef, type KeyboardEvent, type RefObject } from 'react'
import { Icon } from '@/components/ui/icon'
import { maxCartQuantity, type CartEntry, type CartProduct } from '@/lib/cart'
import { formatPrice } from '@/lib/catalog'
import { useCart } from './cart-context'

type ChangeQuantity = (type: 'add' | 'decrease' | 'remove') => void

function CartLine({ entry, product, onChange }: { entry: CartEntry; product: CartProduct; onChange: ChangeQuantity }) {
  const name = product.name.split(' — ')[0]
  const atLimit = entry.quantity >= maxCartQuantity

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b border-line py-4 last:border-0">
      <Image src={product.image} alt="" width={80} height={48} className="h-auto w-16 rounded-ctl sm:w-20" />
      <div className="min-w-0">
        <h3 className="text-sm font-bold wrap-break-word">{product.name}</h3>
        <p className="mt-1 text-sm text-muted">{product.format}</p>
        <p className="mt-1 text-sm text-muted">{formatPrice(product.discountPriceCents)} per unità</p>
        <div role="group" aria-label={'Quantità di ' + name} className="mt-2 flex flex-wrap items-center gap-1">
          <button type="button" className="cart-square button-secondary" aria-label={'Diminuisci quantità di ' + name} onClick={() => onChange('decrease')}><Icon name="minus" size={16} /></button>
          <span className="min-w-5 text-center text-sm tabular-nums">{entry.quantity}</span>
          <button type="button" className="cart-square button-secondary" aria-label={'Aumenta quantità di ' + name} aria-disabled={atLimit || undefined}
            onClick={() => { if (!atLimit) onChange('add') }}><Icon name="plus" size={16} /></button>
          <button type="button" className="icon-button" aria-label={'Rimuovi ' + name} onClick={() => onChange('remove')}><Icon name="trash" size={18} /></button>
        </div>
        <p className="mt-2 text-sm font-semibold"><span className="sr-only">Totale prodotto: </span>{formatPrice(product.discountPriceCents * entry.quantity)}</p>
      </div>
    </li>
  )
}

export function CartDrawer({ dialogRef, closeRef, onClose }: {
  dialogRef: RefObject<HTMLDialogElement | null>
  closeRef: RefObject<HTMLButtonElement | null>
  onClose: (explore: boolean) => void
}) {
  const { entries, products, units, subtotalCents, announcement, change, clear } = useCart()
  const backdropPress = useRef(false)

  function close(explore = false) {
    if (!dialogRef.current?.open) return
    dialogRef.current.close()
    onClose(explore)
  }

  function keepFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') event.stopPropagation()
    if (event.key !== 'Tab') return
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault()
      const next = event.shiftKey ? last : first
      next?.focus()
    }
  }

  return (
    <dialog ref={dialogRef} id="cart-drawer" className="cart-drawer" aria-modal="true" aria-labelledby="cart-title"
      onCancel={event => { event.preventDefault(); close() }}
      onKeyDown={keepFocus}
      onPointerDown={event => { backdropPress.current = event.target === event.currentTarget }}
      onClick={event => {
        if (backdropPress.current && event.target === event.currentTarget) close()
        backdropPress.current = false
      }}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-6">
          <div>
            <h2 id="cart-title" className="text-xl font-bold tracking-tight">Il tuo carrello</h2>
            <p className="mt-1 text-sm text-muted">{units} {units === 1 ? 'articolo' : 'articoli'}</p>
          </div>
          <button ref={closeRef} type="button" className="icon-button" aria-label="Chiudi carrello" onClick={() => close()}><Icon name="close" /></button>
        </div>
        <p role="status" className="sr-only">{announcement}</p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6">
          {units > 0 ? (
            <ul aria-label="Prodotti nel carrello">
              {entries.map(entry => {
                const product = products.get(entry.id)
                return product && (
                  <CartLine key={entry.id} entry={entry} product={product} onChange={type => {
                    if (type === 'remove' || (type === 'decrease' && entry.quantity === 1)) closeRef.current?.focus()
                    change(type, entry.id)
                  }} />
                )
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-subtle text-brand"><Icon name="cart" size={28} /></span>
              <h3 className="text-lg font-bold">Il tuo carrello è vuoto</h3>
              <p className="text-sm text-muted">Esplora il catalogo e aggiungi i prodotti che ti interessano.</p>
              <button type="button" className="button button-secondary" onClick={() => close(true)}>Esplora il catalogo</button>
            </div>
          )}
        </div>
        <div className="shrink-0 space-y-3 border-t border-line bg-surface px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-lg font-bold">
            <span>Subtotale</span><span className="tabular-nums">{formatPrice(subtotalCents)}</span>
          </div>
          <p className="text-sm text-muted">Carrello dimostrativo. Gli acquisti non sono disponibili in questa versione.</p>
          <button type="button" className="button button-primary w-full" onClick={() => close()}>Continua a esplorare</button>
          {units > 0 && <button type="button" className="button button-secondary w-full" onClick={() => { closeRef.current?.focus(); clear() }}>Svuota carrello</button>}
        </div>
      </div>
    </dialog>
  )
}
