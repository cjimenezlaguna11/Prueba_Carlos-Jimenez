import 'server-only'
import products from '../../.generated/products.json'
import { categories, formats, type Product } from '@/types/product'

type CatalogReader = { list(): Promise<readonly Product[]> }

function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const isPrice = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return hasText(entry.id) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) &&
    hasText(entry.name) && hasText(entry.creator) && hasText(entry.description) &&
    categories.some(([id]) => id !== 'tutti' && id === entry.categoryId) &&
    formats.some((format) => format === entry.format) &&
    isPrice(entry.originalPriceCents) && isPrice(entry.discountPriceCents) &&
    entry.originalPriceCents > entry.discountPriceCents && entry.image === `/images/products/${entry.id}.webp` &&
    ((entry.kind === 'test' && hasText(entry.ageRange) && entry.startDate === null) ||
      (entry.kind === 'course' && entry.ageRange === null && isDate(entry.startDate)))
}

const jsonReader: CatalogReader = {
  async list() {
    const entries: unknown = products
    if (!Array.isArray(entries) || !entries.every(isProduct)) throw new Error('Invalid catalog records')
    if (new Set(entries.map((item) => item.id)).size !== entries.length) throw new Error('Duplicate catalog IDs')
    return entries
  }
}

export async function listProducts(): Promise<readonly Product[]> {
  const source = process.env.CATALOG_SOURCE ?? 'json'
  if (source !== 'json') throw new Error('Unsupported catalog source')
  return jsonReader.list()
}
