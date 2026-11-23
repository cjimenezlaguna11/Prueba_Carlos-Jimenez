export type ContactValues = { name: string; email: string; message: string }
export type ContactField = keyof ContactValues

export const contactFields: readonly ContactField[] = ['name', 'email', 'message']
export const emptyContact: ContactValues = { name: '', email: '', message: '' }

const emailAtom = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+$/i
const domainPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

function validEmail(value: string): boolean {
  const address = value.trim()
  const [local, domain, ...rest] = address.split('@')
  return address.length <= 254 && local.length <= 64 && Boolean(domain) &&
    rest.length === 0 && local.split('.').every((atom) => emailAtom.test(atom)) && domainPattern.test(domain)
}

export function validateContact(values: ContactValues): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {}
  if ([...values.name.trim()].length < 2) errors.name = 'Inserisci il tuo nome (almeno 2 caratteri).'
  if (!validEmail(values.email)) errors.email = 'Inserisci un indirizzo email valido.'
  if ([...values.message.trim()].length < 10) errors.message = 'Il messaggio deve contenere almeno 10 caratteri.'
  return errors
}
