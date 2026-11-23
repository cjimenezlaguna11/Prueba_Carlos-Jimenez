const contactFields = ['name', 'email', 'message']
const emailAtom = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+$/i
const domainPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

function validateContact({ name, email, message }) {
  const errors = {}
  const address = email.trim()
  const [local, domain, ...rest] = address.split('@')

  if ([...name.trim()].length < 2) errors.name = 'Inserisci il tuo nome (almeno 2 caratteri).'
  if (address.length > 254 || local.length > 64 || !domain || rest.length ||
      !local.split('.').every(atom => emailAtom.test(atom)) || !domainPattern.test(domain)) {
    errors.email = 'Inserisci un indirizzo email valido.'
  }
  if ([...message.trim()].length < 10) errors.message = 'Il messaggio deve contenere almeno 10 caratteri.'
  return errors
}

function initContact() {
  const $panel = $('[data-contact-panel]')
  const $form = $panel.find('[data-contact]')
  const $success = $panel.find('[data-contact-success]')
  const fields = Object.fromEntries(contactFields.map(field => [field, $('#contact-' + field)]))
  let attempted = false

  function showErrors(errors) {
    for (const [field, $control] of Object.entries(fields)) {
      const error = errors[field]
      const id = $control.attr('id') + '-errore'
      const $error = $('#' + id)
      $error.prop('hidden', !error).find('span').text(error ?? '')
      if (error) $control.attr({ 'aria-invalid': 'true', 'aria-describedby': id })
      else $control.removeAttr('aria-invalid aria-describedby')
    }
  }

  const values = () => Object.fromEntries(Object.entries(fields).map(([key, $input]) => [key, $input.val()]))
  $form.find('fieldset').prop('disabled', false)
  $form.on('input.giuntiContact', () => {
    if (attempted) showErrors(validateContact(values()))
  }).on('submit.giuntiContact', event => {
    event.preventDefault()
    attempted = true
    const errors = validateContact(values())
    showErrors(errors)
    const first = contactFields.find(field => errors[field])
    if (first) {
      fields[first].trigger('focus')
      return
    }

    $form[0].reset()
    attempted = false
    $form.prop('hidden', true)
    $success.prop('hidden', false)
    $panel.find('[data-contact-status]').text('Richiesta simulata correttamente. Nessun messaggio è stato inviato.')
    $('#contact-success').trigger('focus')
  })

  $panel.on('click.giuntiContact', '[data-contact-reset]', () => {
    $success.prop('hidden', true)
    $panel.find('[data-contact-status]').empty()
    $form.prop('hidden', false)
    fields.name.trigger('focus')
  })
}
