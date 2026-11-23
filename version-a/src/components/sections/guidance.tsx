import { Icon } from '@/components/ui/icon'

const guidance = [
  ['layers', 'Strumenti per diversi ambiti professionali', 'Clinica, scuola e organizzazioni: un’offerta articolata per ogni contesto.'],
  ['doc', 'Informazioni chiare per scegliere', 'Formato, fascia d’età e prezzo sempre visibili, senza passaggi superflui.'],
  ['grow', 'Formazione per continuare a crescere', 'Percorsi online e in presenza per aggiornare la tua pratica.']
] as const

export function Guidance() {
  return (
    <section id="guida" tabIndex={-1} aria-labelledby="guida-title" className="bg-subtle py-16 lg:py-20">
      <div className="container-shell">
        <div className="max-w-2xl">
          <h2 id="guida-title" className="section-title">Ogni professionista ha esigenze diverse.</h2>
          <p className="mt-4 text-lg text-muted">Esplora le nostre proposte per individuare gli strumenti più adatti al tuo ambito di lavoro.</p>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {guidance.map(([icon, title, description]) => (
            <li key={title} className="rounded-card border border-line bg-card p-7">
              <span className="grid size-12 place-items-center rounded-ctl bg-subtle text-brand"><Icon name={icon} size={28} /></span>
              <h3 className="mt-5 text-lg leading-snug font-bold">{title}</h3>
              <p className="mt-2 text-label leading-relaxed text-muted">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
