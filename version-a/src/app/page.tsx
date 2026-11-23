import { CatalogProvider } from '@/components/catalog/catalog-context'
import { CartProvider } from '@/components/cart/cart-context'
import { listProducts } from '@/data/catalog'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Catalog } from '@/components/sections/catalog'
import { Contact } from '@/components/sections/contact'
import { Guidance } from '@/components/sections/guidance'
import { Hero } from '@/components/sections/hero'

export default async function Home() {
  const products = await listProducts().catch(() => {
    console.error('Catalogo non disponibile: controllare la sorgente e i dati.')
    return null
  })
  const cartProducts = products?.map(({ id, name, format, image, discountPriceCents }) =>
    ({ id, name, format, image, discountPriceCents })) ?? []

  return (
    <CartProvider products={cartProducts}>
      <CatalogProvider>
        <Header />
        <main id="contenuto" tabIndex={-1}>
          <Hero />
          <Catalog products={products} />
          <Guidance />
          <Contact />
        </main>
        <Footer />
      </CatalogProvider>
    </CartProvider>
  )
}
