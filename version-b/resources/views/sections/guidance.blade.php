<section id="guida" tabindex="-1" aria-labelledby="guida-title" class="guidance">
    <div class="shell">
        <div class="section-intro">
            <h2 id="guida-title" class="section-intro__title">Ogni professionista ha esigenze diverse.</h2>
            <p class="section-intro__copy">Esplora le nostre proposte per individuare gli strumenti più adatti al tuo ambito di lavoro.</p>
        </div>
        <ul class="guidance__items">
            @foreach([
                ['layers', 'Strumenti per diversi ambiti professionali', 'Clinica, scuola e organizzazioni: un’offerta articolata per ogni contesto.'],
                ['doc', 'Informazioni chiare per scegliere', 'Formato, fascia d’età e prezzo sempre visibili, senza passaggi superflui.'],
                ['grow', 'Formazione per continuare a crescere', 'Percorsi online e in presenza per aggiornare la tua pratica.'],
            ] as [$icon, $title, $description])
                <li class="guidance__item">
                    <span class="guidance__icon"><x-icon :name="$icon" :size="28" /></span>
                    <h3 class="guidance__title">{{ $title }}</h3>
                    <p class="guidance__copy">{{ $description }}</p>
                </li>
            @endforeach
        </ul>
    </div>
</section>
