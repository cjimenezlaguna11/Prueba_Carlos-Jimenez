import type { CategoryFilter, Product } from '../types/product'

type SearchableProduct = Pick<Product, 'name' | 'categoryId'>

export function normalizeName(value: string): string {
  return value.trim().normalize('NFD').toLocaleLowerCase('it-IT').replace(/\p{M}/gu, '')
}

export function filterProducts<T extends SearchableProduct>(items: readonly T[], query: string, category: CategoryFilter): T[] {
  const term = normalizeName(query)
  return items.filter((item) =>
    (category === 'tutti' || item.categoryId === category) && (!term || normalizeName(item.name).includes(term))
  )
}

const priceFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', useGrouping: 'always' })
const dateFormatter = new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeZone: 'UTC' })

export const formatPrice = (cents: number) => priceFormatter.format(cents / 100)
export const formatCourseDate = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00Z`))
