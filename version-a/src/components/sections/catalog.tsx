import { CatalogControls } from '@/components/catalog/catalog-controls'
import { ProductCard } from '@/components/catalog/product-card'
import type { Product } from '@/types/product'

export function Catalog({ products }: { products: readonly Product[] | null }) {
  return (
    <section id="catalogo" tabIndex={-1} aria-labelledby="catalogo-title" className="py-16 lg:py-24">
      <div className="container-shell">
        <div className="max-w-2xl">
          <p className="eyebrow">Il nostro catalogo</p>
          <h2 id="catalogo-title" className="section-title mt-3">Trova lo strumento giusto per te</h2>
          <p className="mt-4 text-lg text-muted">Test psicologici e percorsi formativi dimostrativi per esplorare il catalogo professionale.</p>
        </div>
        {products ? <CatalogControls items={products.map((product) => ({ id: product.id, name: product.name, categoryId: product.categoryId, card: <ProductCard product={product} /> }))} /> : (
          <p id="cerca" tabIndex={-1} className="mt-10 rounded-card border border-control bg-subtle p-5">Il catalogo non è disponibile in questo momento. Riprova più tardi.</p>
        )}
      </div>
    </section>
  )
}
