<section id="contatti" tabindex="-1" aria-labelledby="contatti-title" class="contact">
    <div class="shell contact__inner">
        <div>
            <p class="eyebrow">Contatti</p>
            <h2 id="contatti-title" class="section-intro__title section-intro__title--after-eyebrow">Hai bisogno di maggiori informazioni?</h2>
            <p class="section-intro__copy contact__copy">Compila il modulo per provare il percorso di richiesta informazioni.</p>
            <p class="contact__demo"><span class="contact__icon"><x-icon name="mail" /></span> Modulo dimostrativo. Nessun messaggio verrà inviato.</p>
        </div>
        <div class="contact-panel" data-contact-panel>
            <p role="status" class="visually-hidden" data-contact-status></p>
            <form novalidate data-contact>
                <fieldset disabled class="contact-panel__fields">
                    <legend class="visually-hidden">Richiesta di informazioni dimostrativa</legend>
                    @foreach([['name', 'Nome', 'text', 'name'], ['email', 'Email', 'email', 'email'], ['message', 'Messaggio', null, null]] as [$field, $label, $type, $autocomplete])
                        <x-contact-field :$field :$label :$type :$autocomplete />
                    @endforeach
                    <p class="contact-panel__required">I campi contrassegnati con * sono obbligatori.</p>
                    <button type="submit" class="button button--primary contact-panel__submit">Simula invio</button>
                </fieldset>
                <noscript><p class="script-message">Attiva JavaScript per provare il modulo.</p></noscript>
            </form>
            <div class="contact-panel__success" data-contact-success hidden>
                <div class="contact-panel__success-icon"><x-icon name="check" :size="28" /></div>
                <h3 id="contact-success" tabindex="-1" class="contact-panel__success-title">Richiesta simulata correttamente.</h3>
                <p class="contact-panel__success-copy">Nessun messaggio è stato inviato.</p>
                <button type="button" class="button button--secondary contact-panel__restart" data-contact-reset>Prova di nuovo</button>
            </div>
        </div>
    </div>
</section>
