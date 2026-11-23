import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { sectionLinks } from './navigation'
import { SectionLink } from './section-link'

const socialNetworks = [
  ['Instagram', 'instagram'],
  ['LinkedIn', 'linkedin'],
  ['YouTube', 'youtube'],
  ['Facebook', 'facebook']
] as const

export function Footer() {
  return (
    <footer className="bg-footer text-footer-ink">
      <div className="container-shell py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="w-fit max-w-full rounded-ctl bg-(--ds-base-color-white)">
              <Image unoptimized loading="eager" src="/giunti-psychometrics.png" alt="Giunti Psychometrics" width={974} height={300} className="h-auto w-44 max-w-full md:w-48 lg:w-50" />
            </div>
            <p className="mt-3 leading-relaxed text-footer-muted">Strumenti di assessment e formazione per accompagnare la pratica dei professionisti della psicologia.</p>
          </div>
          <nav aria-label="Navigazione a piè di pagina">
            <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
              {sectionLinks.map(({ label, target, category }) => (
                <li key={label}>
                  <SectionLink target={target} category={category} className="inline-flex min-h-(--ds-control-target) items-center rounded-ctl px-3 text-label font-medium text-footer-muted hover:bg-footer-hover hover:text-footer-ink">
                    {label}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-5 border-t border-footer-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-footer-muted">
            <p>© 2026 Giunti Psychometrics. Tutti i diritti riservati.</p>
            <p className="mt-2">Progetto dimostrativo. I prodotti e i corsi del catalogo sono fittizi.</p>
          </div>
          <ul aria-label="Social (segnaposto dimostrativi)" className="flex flex-wrap gap-2 sm:shrink-0">
            {socialNetworks.map(([label, icon]) => (
              <li key={label}>
                <span role="img" aria-label={label} className="grid size-(--ds-control-target) place-items-center rounded-full border border-footer-line text-footer-muted">
                  <Icon name={icon} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
