'use client'

import type { MouseEvent, ReactNode } from 'react'
import type { CategoryFilter } from '@/types/product'
import { useCatalogCategory } from '@/components/catalog/catalog-context'

type SectionLinkProps = {
  target: string
  category?: CategoryFilter
  children: ReactNode
  className?: string
  onNavigate?: () => void
}

export function SectionLink({ target, category, children, className, onNavigate }: SectionLinkProps) {
  const { setCategory } = useCatalogCategory()

  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (category) setCategory(category)
    onNavigate?.()
    requestAnimationFrame(() => document.getElementById(target)?.focus({ preventScroll: true }))
  }

  return <a href={'#' + target} className={className} onClick={navigate}>{children}</a>
}
