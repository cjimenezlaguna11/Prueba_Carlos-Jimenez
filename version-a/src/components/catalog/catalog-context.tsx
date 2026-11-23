'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CategoryFilter } from '@/types/product'

const CatalogContext = createContext<{
  category: CategoryFilter
  setCategory: (category: CategoryFilter) => void
} | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<CategoryFilter>('tutti')
  return <CatalogContext.Provider value={{ category, setCategory }}>{children}</CatalogContext.Provider>
}

export function useCatalogCategory() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('CatalogProvider is required')
  return context
}
