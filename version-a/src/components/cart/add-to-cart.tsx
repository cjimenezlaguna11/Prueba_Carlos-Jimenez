'use client'

import { Icon } from '@/components/ui/icon'
import { useHydrated } from '@/lib/use-hydrated'
import { maxCartQuantity } from '@/lib/cart'
import { useCart } from './cart-context'

export function AddToCart({ id, name }: { id: string; name: string }) {
  const { entries, change } = useCart()
  const hydrated = useHydrated()
  const atLimit = entries.some(entry => entry.id === id && entry.quantity >= maxCartQuantity)

  return (
    <button type="button" disabled={!hydrated} aria-disabled={atLimit || undefined}
      aria-label={atLimit ? 'Limite raggiunto per ' + name : 'Aggiungi ' + name + ' al carrello'}
      className="cart-square button-secondary"
      onClick={() => { if (!atLimit) change('add', id, true) }}>
      <Icon name="cart" />
    </button>
  )
}
