<header class="site-header">
    <div class="shell site-header__inner">
        <a href="#contenuto" class="brand brand--header" aria-label="Giunti Psychometrics Italia, pagina iniziale"><x-brand /></a>
        <div class="site-header__controls" data-header>
            <nav aria-label="Principale" class="site-header__desktop">
                <x-navigation :$links item-class="site-header__link" list-class="site-header__list" />
            </nav>
            <x-section-link target="cerca" class="icon-button"><x-icon name="search" /><span class="visually-hidden">Cerca nel catalogo</span></x-section-link>
            <button type="button" disabled data-cart-open class="icon-button site-header__cart" aria-label="Apri carrello, 0 articoli" aria-haspopup="dialog" aria-controls="cart-drawer" aria-expanded="false">
                <x-icon name="cart" /><span class="site-header__cart-badge" aria-hidden="true" data-cart-badge>0</span>
            </button>
            @include('sections.cart')
            <button type="button" disabled data-menu-toggle class="icon-button site-header__toggle" aria-controls="menu-principale" aria-expanded="false" aria-label="Apri menu">
                <span data-menu-icon><x-icon name="menu" :size="24" /></span><span data-close-icon hidden><x-icon name="close" :size="24" /></span>
            </button>
            <div id="menu-principale" class="site-header__panel">
                <nav aria-label="Principale" class="site-header__mobile">
                    <x-navigation :$links item-class="site-header__link" list-class="site-header__list" />
                </nav>
                <span aria-hidden="true" class="site-header__divider"></span>
                <fieldset disabled class="appearance" data-appearance>
                    <legend class="visually-hidden">Aspetto</legend>
                    <div class="appearance__control">
                        @foreach([['light','Chiaro','sun'], ['dark','Scuro','moon'], ['system','Sistema','monitor']] as [$value, $label, $icon])
                            <label data-preference="{{ $value }}" class="appearance__option">
                                <input type="radio" name="appearance" value="{{ $value }}" @checked($value === 'system')>
                                <span class="appearance__icon"><x-icon :name="$icon" :size="18" /></span>
                                <span class="visually-hidden">{{ $label }}</span>
                            </label>
                        @endforeach
                    </div>
                </fieldset>
                <details class="site-header__demo" data-login>
                    <summary aria-label="Accedi (demo)" class="button button--primary site-header__login"><x-icon name="user" :size="16" />Accedi</summary>
                    <p tabindex="-1" class="site-header__message">Accesso dimostrativo. Questa pagina non prevede account.</p>
                </details>
            </div>
        </div>
    </div>
</header>
