export const cartStorageKey = 'giunti.cart.v1'
export const maxCartQuantity = 99

export type CartEntry = Readonly<{ id: string; quantity: number }>
export type CartProduct = Readonly<{ id: string; name: string; format: string; image: string; discountPriceCents: number }>
type CartAction = { type: 'add' | 'decrease' | 'remove'; id: string } | { type: 'clear' }

export const emptyCart: readonly CartEntry[] = []

export function readCart(raw: string | null, productIds: ReadonlySet<string>): readonly CartEntry[] {
  if (!raw) return emptyCart
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return emptyCart
  }
  if (!Array.isArray(data)) return emptyCart

  const entries = new Map<string, CartEntry>()
  for (const entry of data as unknown[]) {
    if (!entry || typeof entry !== 'object' || !('id' in entry) || !('quantity' in entry)) continue
    const { id, quantity } = entry
    if (typeof id === 'string' && productIds.has(id) && !entries.has(id) &&
      typeof quantity === 'number' && Number.isInteger(quantity) && quantity >= 1 && quantity <= maxCartQuantity) {
      entries.set(id, { id, quantity })
    }
  }
  return [...entries.values()]
}

export function updateCart(entries: readonly CartEntry[], action: CartAction): readonly CartEntry[] {
  if (action.type === 'clear') return emptyCart
  const entry = entries.find(item => item.id === action.id)
  if (!entry) return action.type === 'add' ? [...entries, { id: action.id, quantity: 1 }] : entries
  if (action.type === 'remove' || (action.type === 'decrease' && entry.quantity === 1)) {
    return entries.filter(item => item.id !== action.id)
  }
  if (action.type === 'add' && entry.quantity >= maxCartQuantity) return entries
  const quantity = entry.quantity + (action.type === 'add' ? 1 : -1)
  return entries.map(item => item.id === action.id ? { id: item.id, quantity } : item)
}

export function summarizeCart(entries: readonly CartEntry[], products: ReadonlyMap<string, CartProduct>) {
  return entries.reduce((total, { id, quantity }) => {
    const product = products.get(id)
    if (product) {
      total.units += quantity
      total.subtotalCents += product.discountPriceCents * quantity
    }
    return total
  }, { units: 0, subtotalCents: 0 })
}
