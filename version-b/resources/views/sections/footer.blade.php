<footer class="site-footer">
    <div class="shell site-footer__inner">
        <div class="site-footer__top">
            <div class="site-footer__description">
                <div class="brand brand--footer"><x-brand /></div>
                <p class="site-footer__copy">Strumenti di assessment e formazione per accompagnare la pratica dei professionisti della psicologia.</p>
            </div>
            <nav aria-label="Navigazione a piè di pagina">
                <x-navigation :$links item-class="site-footer__link" list-class="site-footer__links" />
            </nav>
        </div>
        <div class="site-footer__bottom">
            <div class="site-footer__legal">
                <p>© 2026 Giunti Psychometrics. Tutti i diritti riservati.</p>
                <p>Progetto dimostrativo. I prodotti e i corsi del catalogo sono fittizi.</p>
            </div>
            <ul aria-label="Social (segnaposto dimostrativi)" class="site-footer__social">
                @foreach(['Instagram' => 'instagram', 'LinkedIn' => 'linkedin', 'YouTube' => 'youtube', 'Facebook' => 'facebook'] as $label => $icon)
                    <li><span role="img" aria-label="{{ $label }}" class="site-footer__icon"><x-icon :name="$icon" /></span></li>
                @endforeach
            </ul>
        </div>
    </div>
</footer>
