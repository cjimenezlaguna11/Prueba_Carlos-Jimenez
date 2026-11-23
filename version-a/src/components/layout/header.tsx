import Image from 'next/image'
import { HeaderControls } from './header-controls'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-header">
      <div className="container-shell flex min-h-(--ds-header-height-small) items-center justify-between gap-2 md:min-h-(--ds-header-height-wide) lg:gap-4">
        <a href="#contenuto" className="flex min-w-0 items-center rounded-ctl bg-(--ds-base-color-white)" aria-label="Giunti Psychometrics Italia, pagina iniziale">
          <Image unoptimized loading="eager" src="/giunti-psychometrics.png" alt="Giunti Psychometrics" width={974} height={300} className="h-auto w-44 max-w-full md:w-48 lg:w-50" />
        </a>
        <HeaderControls />
      </div>
    </header>
  )
}
