'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import { CartControl } from '@/components/cart/cart-control'
import { useHydrated } from '@/lib/use-hydrated'
import { AppearanceSelect } from './appearance-select'
import { sectionLinks } from './navigation'
import { SectionLink } from './section-link'

function HeaderNavigation({ className, onNavigate }: { className: string; onNavigate: () => void }) {
  return (
    <nav aria-label="Principale" className={className}>
      <ul className="flex flex-col lg:flex-row lg:gap-1">
        {sectionLinks.map(({ label, target, category }) => (
          <li key={label}>
            <SectionLink target={target} category={category} onNavigate={onNavigate} className="flex min-h-(--ds-control-target) items-center rounded-ctl px-3 text-label font-medium whitespace-nowrap hover:bg-hover hover:text-brand active:bg-active">
              {label}
            </SectionLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function HeaderControls() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const demo = useRef<HTMLDetailsElement>(null)
  const demoToggle = useRef<HTMLElement>(null)
  const hydrated = useHydrated()

  function closeMenu() {
    if (demo.current) demo.current.open = false
    setOpen(false)
  }

  function handleEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return
    if (demo.current?.open) {
      demo.current.open = false
      demoToggle.current?.focus()
    } else if (open) {
      closeMenu()
      toggle.current?.focus()
    }
  }

  const panel = 'absolute inset-x-0 top-full max-h-[calc(100dvh-var(--ds-header-height-small))] flex-col gap-3 overflow-y-auto border-b border-line bg-header px-5 py-3 md:max-h-[calc(100dvh-var(--ds-header-height-wide))] lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:overflow-visible lg:border-0 lg:p-0'

  return (
    <div className="flex min-w-0 items-center justify-end gap-1 lg:flex-1 lg:gap-3" onKeyDown={handleEscape} onBlur={(event) => {
      const nextFocus = event.relatedTarget
      if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) closeMenu()
    }}>
      <HeaderNavigation className="hidden lg:mr-auto lg:block" onNavigate={closeMenu} />
      <SectionLink target="cerca" className="icon-button" onNavigate={closeMenu}>
        <Icon name="search" /><span className="sr-only">Cerca nel catalogo</span>
      </SectionLink>
      <CartControl onOpen={closeMenu} />
      <button ref={toggle} type="button" disabled={!hydrated} className="icon-button lg:hidden" aria-controls="menu-principale" aria-expanded={open} aria-label={open ? 'Chiudi menu' : 'Apri menu'} onClick={() => open ? closeMenu() : setOpen(true)}>
        <Icon name={open ? 'close' : 'menu'} size={24} />
      </button>
      <div id="menu-principale" className={(open ? 'flex ' : 'hidden ') + panel}>
        <HeaderNavigation className="lg:hidden" onNavigate={closeMenu} />
        <span aria-hidden="true" className="hidden h-7 w-px shrink-0 bg-line lg:block" />
        <AppearanceSelect />
        <details ref={demo} className="relative">
          <summary ref={demoToggle} aria-label="Accedi (demo)" className="button button-primary w-full lg:w-auto"><Icon name="user" size={16} />Accedi</summary>
          <p tabIndex={-1} className="mt-2 rounded-ctl border border-line bg-surface p-3 text-sm text-ink shadow-card lg:absolute lg:right-0 lg:w-56">
            Accesso dimostrativo. Questa pagina non prevede account.
          </p>
        </details>
      </div>
    </div>
  )
}
