<section id="catalogo" tabindex="-1" aria-labelledby="catalogo-title" class="catalog" data-catalog>
    <div class="shell">
        <div class="section-intro">
            <p class="eyebrow">Il nostro catalogo</p>
            <h2 id="catalogo-title" class="section-intro__title section-intro__title--after-eyebrow">Trova lo strumento giusto per te</h2>
            <p class="section-intro__copy">Test psicologici e percorsi formativi dimostrativi per esplorare il catalogo professionale.</p>
        </div>
        @if($products === null)
            <p id="cerca" tabindex="-1" class="catalog__unavailable">Il catalogo non è disponibile in questo momento. Riprova più tardi.</p>
        @else
            <div class="catalog__controls">
                <div role="search" class="catalog__search">
                    <label for="cerca" class="visually-hidden">Cerca un test o un corso</label>
                    <span class="catalog__search-icon"><x-icon name="search" /></span>
                    <input id="cerca" type="search" readonly placeholder="Cerca un test o un corso..." class="field catalog__input">
                    <button type="button" aria-label="Cancella ricerca" class="icon-button catalog__search-clear" data-clear-search hidden><x-icon name="x" :size="18" /></button>
                </div>
                <div role="group" aria-label="Filtra per categoria" class="catalog__filters">
                    @foreach($categories as $id => $name)
                        <button type="button" disabled aria-pressed="{{ $id === 'tutti' ? 'true' : 'false' }}" data-category="{{ $id }}" data-category-label="{{ $name }}" class="category-pill"><span class="category-pill__check"><x-icon name="check" :size="14" /></span>{{ $name }}</button>
                    @endforeach
                </div>
                <noscript><p class="script-message">Attiva JavaScript per usare la ricerca e i filtri.</p></noscript>
            </div>
            <div class="catalog__results">
                <p role="status" aria-atomic="true" class="catalog__count"><strong data-result-count>{{ count($products) }}</strong> <span data-result-label>{{ count($products) === 1 ? 'prodotto disponibile' : 'prodotti disponibili' }}</span><span class="visually-hidden" data-result-category></span></p>
                <button type="button" data-clear-filters data-clear-results class="button button--secondary" hidden>Cancella filtri</button>
            </div>
            <ul aria-label="Prodotti del catalogo" class="catalog__grid" @if(!$products) hidden @endif>
                @foreach($products as $product)
                    <li class="catalog__item" data-product="{{ $product['id'] }}" data-name="{{ $product['name'] }}" data-product-category="{{ $product['categoryId'] }}">
                        <x-product-card :$product :$format :category="$categories[$product['categoryId']]" />
                    </li>
                @endforeach
            </ul>
            <div class="catalog__empty" data-empty-results @if($products) hidden @endif>
                <span class="catalog__empty-icon"><x-icon name="search" /></span>
                <h3 class="catalog__empty-title">Nessun risultato trovato</h3>
                <p class="catalog__empty-copy">Prova con un altro termine o cancella i filtri.</p>
                <button type="button" data-clear-filters class="button button--secondary catalog__empty-reset">Cancella filtri</button>
            </div>
        @endif
    </div>
</section>
