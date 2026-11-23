'use client'

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { cartStorageKey, emptyCart, readCart, summarizeCart, updateCart, type CartEntry, type CartProduct } from '@/lib/cart'

function createCartStore(productIds: ReadonlySet<string>) {
  let current: readonly CartEntry[] | undefined
  const subscribers = new Set<() => void>()
  const notify = () => subscribers.forEach(listener => listener())

  function getSnapshot() {
    if (!current) {
      try {
        current = readCart(window.localStorage.getItem(cartStorageKey), productIds)
      } catch {
        current = emptyCart
      }
    }
    return current
  }

  function subscribe(listener: () => void) {
    subscribers.add(listener)
    return () => { subscribers.delete(listener) }
  }

  function commit(action: Parameters<typeof updateCart>[1]) {
    const before = getSnapshot()
    if ('id' in action && !productIds.has(action.id)) return before
    const next = updateCart(before, action)
    if (next !== before) {
      current = next
      if (productIds.size > 0) {
        try {
          window.localStorage.setItem(cartStorageKey, JSON.stringify(next))
        } catch {
          // A browser with blocked storage can still use the in-memory cart.
        }
      }
      notify()
    }
    return next
  }

  return { getSnapshot, subscribe, commit }
}

const getServerSnapshot = () => emptyCart

type CartContextValue = {
  entries: readonly CartEntry[]
  products: ReadonlyMap<string, CartProduct>
  units: number
  subtotalCents: number
  announcement: string
  change: (type: 'add' | 'decrease' | 'remove', id: string, confirm?: boolean) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ products, children }: { products: readonly CartProduct[]; children: ReactNode }) {
  const [catalog] = useState(() => new Map(products.map(product => [product.id, product])))
  const [store] = useState(() => createCartStore(new Set(catalog.keys())))
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot)
  const [announcement, announce] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const confirmationTimer = useRef(0)
  useEffect(() => () => window.clearTimeout(confirmationTimer.current), [])

  function change(type: 'add' | 'decrease' | 'remove', id: string, confirm = false) {
    const product = catalog.get(id)
    if (!product) return
    const before = store.getSnapshot()
    const next = store.commit({ type, id })
    if (before === next) return
    const quantity = next.find(entry => entry.id === id)?.quantity ?? 0
    const name = product.name.split(' — ')[0]
    const message = quantity === 0 ? name + ' rimosso dal carrello.' : name + ': ' + quantity + ' unità nel carrello.'
    announce(message)
    if (confirm) {
      window.clearTimeout(confirmationTimer.current)
      setShowConfirmation(true)
      confirmationTimer.current = window.setTimeout(() => setShowConfirmation(false), 2200)
    }
  }

  function clear() {
    store.commit({ type: 'clear' })
    announce('Carrello svuotato.')
  }

  return (
    <CartContext.Provider value={{ entries, products: catalog, ...summarizeCart(entries, catalog), announcement, change, clear }}>
      {children}
      <p role="status" className={showConfirmation
        ? 'pointer-events-none fixed right-4 bottom-4 z-40 max-w-[calc(100%_-_2rem)] rounded-ctl border border-line bg-surface px-4 py-2 text-sm text-ink shadow-card'
        : 'sr-only'}>{announcement}</p>
    </CartContext.Provider>
  )
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('CartProvider is required')
  return cart
}
