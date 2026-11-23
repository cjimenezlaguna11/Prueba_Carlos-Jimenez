import { Icon } from '@/components/ui/icon'
import { ContactForm } from './contact-form'

export function Contact() {
  return (
    <section id="contatti" tabIndex={-1} aria-labelledby="contatti-title" className="py-16 lg:py-24">
      <div className="container-shell grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <p className="eyebrow">Contatti</p>
          <h2 id="contatti-title" className="section-title mt-3">Hai bisogno di maggiori informazioni?</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">Compila il modulo per provare il percorso di richiesta informazioni.</p>
          <p className="mt-8 flex items-center gap-3 text-label">
            <span className="grid size-10 shrink-0 place-items-center rounded-ctl bg-subtle text-brand"><Icon name="mail" /></span>
            Modulo dimostrativo. Nessun messaggio verrà inviato.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}
