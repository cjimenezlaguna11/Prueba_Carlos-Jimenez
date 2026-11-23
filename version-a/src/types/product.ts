export const categories = [
  ['tutti', 'Tutti'],
  ['clinica', 'Clinica e Neuropsicologia'],
  ['scuola', 'Scuola ed Età evolutiva'],
  ['lavoro', 'Lavoro e Organizzazioni'],
  ['formazione', 'Formazione']
] as const

export const formats = ['Digitale', 'Cartaceo', 'Corso online', 'In presenza'] as const

export type CategoryFilter = (typeof categories)[number][0]
export type Category = Exclude<CategoryFilter, 'tutti'>

type ProductFields = {
  id: string
  name: string
  categoryId: Category
  creator: string
  format: (typeof formats)[number]
  originalPriceCents: number
  discountPriceCents: number
  image: string
  description: string
}

export type Product = ProductFields & (
  | { kind: 'test'; ageRange: string; startDate: null }
  | { kind: 'course'; ageRange: null; startDate: string }
)
