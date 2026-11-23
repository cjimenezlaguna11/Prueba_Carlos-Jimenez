'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import { contactFields, emptyContact, validateContact, type ContactField } from '@/lib/contact'
import { useHydrated } from '@/lib/use-hydrated'

const fields = {
  name: { label: 'Nome', type: 'text', autoComplete: 'name' },
  email: { label: 'Email', type: 'email', autoComplete: 'email' },
  message: { label: 'Messaggio', type: undefined, autoComplete: undefined }
}
const successTitle = 'Richiesta simulata correttamente.'
const successDescription = 'Nessun messaggio è stato inviato.'

export function ContactForm() {
  const [values, setValues] = useState(emptyContact)
  const [attempted, setAttempted] = useState(false)
  const [done, setDone] = useState(false)
  const [focusRequest, requestFocus] = useState<{ target: ContactField | 'success' }>()
  const panel = useRef<HTMLDivElement>(null)
  const hydrated = useHydrated()
  const errors = attempted ? validateContact(values) : {}

  useEffect(() => {
    if (focusRequest) panel.current?.querySelector<HTMLElement>('#contact-' + focusRequest.target)?.focus()
  }, [focusRequest])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    const validation = validateContact(values)
    const firstError = contactFields.find((field) => validation[field])
    if (firstError) {
      requestFocus({ target: firstError })
      return
    }
    setValues(emptyContact)
    setAttempted(false)
    setDone(true)
    requestFocus({ target: 'success' })
  }

  function reset() {
    setDone(false)
    requestFocus({ target: 'name' })
  }

  return (
    <div ref={panel} className="min-w-0 rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
      <p role="status" className="sr-only">{done ? successTitle + ' ' + successDescription : ''}</p>
      {done ? (
        <div className="flex flex-col items-center px-2 py-10 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-success-panel text-success"><Icon name="check" size={28} /></div>
          <h3 id="contact-success" tabIndex={-1} className="mt-6 text-2xl font-bold text-success">{successTitle}</h3>
          <p className="mt-2 max-w-sm text-muted">{successDescription}</p>
          <button type="button" onClick={reset} className="button button-secondary mt-6">Prova di nuovo</button>
        </div>
      ) : (
        <form noValidate onSubmit={submit}>
          <fieldset disabled={!hydrated} className="min-w-0 space-y-5">
            <legend className="sr-only">Richiesta di informazioni dimostrativa</legend>
            {contactFields.map((field) => {
              const { label, type, autoComplete } = fields[field]
              const error = errors[field]
              const id = 'contact-' + field
              const common = {
                id,
                required: true,
                value: values[field],
                'aria-invalid': error ? true : undefined,
                'aria-describedby': error ? id + '-errore' : undefined,
                onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setValues((current) => ({ ...current, [field]: event.target.value }))
              }
              return (
                <div key={field}>
                  <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label} <span className="text-danger" aria-hidden="true">*</span></label>
                  {field === 'message' ? <textarea {...common} rows={5} className="field-control block resize-y py-3" /> :
                    <input {...common} type={type} autoComplete={autoComplete} className="field-control h-12" />}
                  {error && <p id={id + '-errore'} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger"><Icon name="alert" size={16} />{error}</p>}
                </div>
              )
            })}
            <p className="text-xs text-muted">I campi contrassegnati con * sono obbligatori.</p>
            <button type="submit" className="button button-primary min-h-12 w-full">Simula invio</button>
          </fieldset>
          <noscript><p className="mt-3 text-sm text-muted">Attiva JavaScript per provare il modulo.</p></noscript>
        </form>
      )}
    </div>
  )
}
