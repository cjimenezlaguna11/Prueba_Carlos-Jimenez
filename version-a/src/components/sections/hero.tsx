import Image from 'next/image'
import { SectionLink } from '@/components/layout/section-link'
import { Icon } from '@/components/ui/icon'

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-linear-to-b from-hero-wash to-page">
      <div className="container-shell grid items-center gap-10 py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-20">
        <div>
          <p className="eyebrow">Strumenti per professionisti</p>
          <h1 id="hero-title" className="mt-5 text-hero leading-(--ds-base-font-leading-tight) font-extrabold tracking-[-0.03em] sm:text-hero-medium lg:text-hero-wide">La conoscenza che guida ogni valutazione.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">Esplora strumenti di assessment e percorsi formativi pensati per accompagnare la tua pratica professionale, dalla ricerca all’applicazione.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <SectionLink target="catalogo" className="button button-primary min-h-12 px-6">Esplora il catalogo <Icon name="arrow" size={18} /></SectionLink>
            <SectionLink target="catalogo" category="formazione" className="button button-secondary min-h-12 px-6">Scopri la formazione</SectionLink>
          </div>
        </div>
        <Image unoptimized src="/images/hero.svg" alt="" width={520} height={460} fetchPriority="high" loading="eager" className="mx-auto h-auto w-full max-w-[520px]" />
      </div>
    </section>
  )
}
