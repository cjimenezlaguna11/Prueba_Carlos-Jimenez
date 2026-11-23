import Image from 'next/image'
import { categories, type Product } from '@/types/product'
import { formatPrice } from '@/lib/catalog'
import { AddToCart } from '@/components/cart/add-to-cart'
import { ProductMetadata } from './product-metadata'
import designTokens from '../../../.generated/design-tokens.json'

const { breakpoint, size, space } = designTokens.primitives
const maxCoverWidth = (parseFloat(size.container) - 2 * parseFloat(space['8']) - 2 * parseFloat(space['6'])) / 3
const coverSizes = `(min-width: ${size.container}) ${maxCoverWidth}rem, (min-width: ${breakpoint.lg}) 33vw, (min-width: ${breakpoint.md}) 50vw, calc(100vw - ${2 * parseFloat(space['5'])}rem)`

const coverAlt: Record<string, string> = {
  equilibria: 'Copertina blu con linee ondulate e un cerchio azzurro.',
  neurovia: 'Copertina blu con quadrati concentrici ruotati e un cerchio azzurro.',
  crescita: 'Copertina azzurra con linee diagonali e un cerchio chiaro.',
  apprendo: 'Copertina azzurra con anelli concentrici.',
  talentia: 'Copertina blu scuro con linee ondulate e un cerchio turchese.',
  sinergia: 'Copertina blu scuro con quadrati ruotati e un cerchio turchese.',
  'fondamenti-assessment': 'Copertina blu con diagonali e un cerchio azzurro chiaro.',
  'psicologia-organizzazioni': 'Copertina blu con anelli concentrici azzurri.'
}

export function ProductCard({ product }: { product: Product }) {
  const label = categories.find(([id]) => id === product.categoryId)?.[1]
  const [title, ...subtitleParts] = product.name.split(' — ')
  const subtitle = subtitleParts.join(' — ')

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-line bg-card shadow-card transition-[box-shadow,translate,border-color] hover:-translate-y-1 hover:border-brand hover:shadow-lift">
      <div className="relative">
        <Image
          src={product.image}
          alt={coverAlt[product.id] ?? 'Copertina geometrica nei toni del blu.'}
          width={800}
          height={480}
          sizes={coverSizes}
          className="block aspect-(--ds-card-cover-ratio) h-auto w-full object-cover"
        />
        <span className="absolute top-3 left-3 rounded-pill bg-surface px-2.5 py-1 text-xs font-semibold text-ink shadow-card">{product.kind === 'test' ? 'Test' : 'Corso'}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wider text-brand uppercase">{label}</p>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-(--ds-badge-bg) px-2.5 py-1 text-xs font-semibold text-(--ds-badge-text)">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />{product.format}
          </span>
        </div>
        <h3 className="mt-3 text-xl leading-snug font-bold tracking-tight wrap-break-word">
          {title}{subtitle && <><span className="sr-only"> — </span><span className="mt-0.5 block text-label font-medium text-muted">{subtitle}</span></>}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{product.description}</p>
        <ProductMetadata product={product} />
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-baseline gap-2 border-t border-line pt-4">
            <span className="text-2xl font-extrabold tracking-tight"><span className="sr-only">Prezzo scontato </span>{formatPrice(product.discountPriceCents)}</span>
            <s className="text-sm text-(--ds-price-original)"><span className="sr-only">Prezzo originale </span>{formatPrice(product.originalPriceCents)}</s>
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <details className="group">
              <summary className="button button-primary w-full px-2">
                <span className="group-open:hidden">Scopri di più</span><span className="hidden group-open:inline">Nascondi dettagli</span><span className="sr-only"> su {product.name}</span>
              </summary>
              <p className="mt-3 rounded-ctl bg-subtle p-3 text-sm leading-relaxed text-muted">
                {product.kind === 'test' ? 'Scheda dimostrativa di uno strumento fittizio a scopo illustrativo.' : 'Scheda dimostrativa di un percorso formativo fittizio.'} Il prodotto non è in vendita.
              </p>
            </details>
            <AddToCart id={product.id} name={title} />
          </div>
        </div>
      </div>
    </article>
  )
}
