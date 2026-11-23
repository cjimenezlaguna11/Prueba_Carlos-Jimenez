'use client'

import { useRef, useState, type ReactNode } from 'react'
import { useCatalogCategory } from './catalog-context'
import { categories, type Category } from '@/types/product'
import { filterProducts } from '@/lib/catalog'
import { Icon } from '@/components/ui/icon'
import { useHydrated } from '@/lib/use-hydrated'

export type CatalogItem = { id: string; name: string; categoryId: Category; card: ReactNode }

export function CatalogControls({ items }: { items: readonly CatalogItem[] }) {
  const [query, setQuery] = useState('')
  const { category, setCategory } = useCatalogCategory()
  const input = useRef<HTMLInputElement>(null)
  const hydrated = useHydrated()
  const results = filterProducts(items, query, category)
  const label = categories.find(([id]) => id === category)?.[1]

  function clearSearch() {
    setQuery('')
    input.current?.focus()
  }

  function clearAll() {
    clearSearch()
    setCategory('tutti')
  }

  return (
    <>
      <div className="mt-10 rounded-card border border-line bg-(--ds-search-panel) p-4 sm:p-5">
        <div role="search" className="relative">
          <label htmlFor="cerca" className="sr-only">Cerca un test o un corso</label>
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"><Icon name="search" /></span>
          <input ref={input} id="cerca" type="search" readOnly={!hydrated} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca un test o un corso..." className="field-control h-(--ds-search-height) pr-14 pl-12" />
          {query && <button onClick={clearSearch} type="button" aria-label="Cancella ricerca" className="icon-button absolute top-1/2 right-1.5 -translate-y-1/2"><Icon name="x" size={18} /></button>}
        </div>
        <div role="group" aria-label="Filtra per categoria" className="mt-4 flex flex-wrap gap-2">
          {categories.map(([id, name]) => (
            <button key={id} type="button" disabled={!hydrated} aria-pressed={id === category} onClick={() => setCategory(id)} className="category-pill">
              {id === category && <Icon name="check" size={14} />}{name}
            </button>
          ))}
        </div>
        <noscript><p className="mt-3 text-sm text-muted">Attiva JavaScript per usare la ricerca e i filtri.</p></noscript>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p role="status" aria-atomic="true" className="text-sm font-medium text-muted">
          <strong className="text-ink">{results.length}</strong> {results.length === 1 ? 'prodotto disponibile' : 'prodotti disponibili'}
          {category !== 'tutti' && <span className="sr-only"> in {label}</span>}
        </p>
        {results.length > 0 && (query || category !== 'tutti') && <button type="button" onClick={clearAll} className="button button-secondary">Cancella filtri</button>}
      </div>
      {results.length > 0 ? (
        <ul aria-label="Prodotti del catalogo" className="mt-5 grid grid-cols-1 gap-(--ds-layout-card-gap) md:grid-cols-2 lg:grid-cols-3">
          {results.map(({ id, card }) => <li key={id} className="min-w-0" data-product={id}>{card}</li>)}
        </ul>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-card border border-dashed border-control bg-subtle px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-surface text-brand shadow-card"><Icon name="search" /></div>
          <h3 className="mt-5 text-xl font-bold">Nessun risultato trovato</h3>
          <p className="mt-2 max-w-md text-muted">Prova con un altro termine o cancella i filtri.</p>
          <button type="button" onClick={clearAll} className="button button-secondary mt-6">Cancella filtri</button>
        </div>
      )}
    </>
  )
}
