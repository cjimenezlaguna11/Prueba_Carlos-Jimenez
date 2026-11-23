@props(['product', 'category', 'format'])
@php
    [$title, $subtitle] = array_pad(explode(' — ', $product['name'], 2), 2, null);
    $test = $product['kind'] === 'test';
    $coverAlt = [
        'equilibria' => 'Copertina blu con linee ondulate e un cerchio azzurro.',
        'neurovia' => 'Copertina blu con quadrati concentrici ruotati e un cerchio azzurro.',
        'crescita' => 'Copertina azzurra con linee diagonali e un cerchio chiaro.',
        'apprendo' => 'Copertina azzurra con anelli concentrici.',
        'talentia' => 'Copertina blu scuro con linee ondulate e un cerchio turchese.',
        'sinergia' => 'Copertina blu scuro con quadrati ruotati e un cerchio turchese.',
        'fondamenti-assessment' => 'Copertina blu con diagonali e un cerchio azzurro chiaro.',
        'psicologia-organizzazioni' => 'Copertina blu con anelli concentrici azzurri.',
    ];
@endphp
<article class="product-card">
    <div class="product-card__cover">
        <img src="{{ $product['image'] }}" alt="{{ $coverAlt[$product['id']] ?? 'Copertina geometrica nei toni del blu.' }}" width="800" height="480" loading="lazy" decoding="async" class="product-card__image">
        <span class="product-card__kind">{{ $test ? 'Test' : 'Corso' }}</span>
    </div>
    <div class="product-card__body">
        <div class="product-card__classification">
            <p class="product-card__category">{{ $category }}</p>
            <span class="product-card__format"><span class="product-card__dot" aria-hidden="true"></span>{{ $product['format'] }}</span>
        </div>
        <h3 class="product-card__title">{{ $title }}@if($subtitle)<span class="visually-hidden"> — </span><span class="product-card__subtitle">{{ $subtitle }}</span>@endif</h3>
        <p class="product-card__description">{{ $product['description'] }}</p>
        <ul aria-label="Informazioni sul prodotto" class="metadata">
            <x-metadata-row icon="user" :label="$test ? 'Autore/Autrice' : 'Docente'">{{ $product['creator'] }}</x-metadata-row>
            <x-metadata-row :icon="$test ? 'users' : 'cal'" :label="$test ? 'Età' : 'Inizio'">
                @if($test){{ $product['ageRange'] }}@else<time datetime="{{ $product['startDate'] }}">{{ $format->date($product['startDate']) }}</time>@endif
            </x-metadata-row>
        </ul>
        <div class="product-card__bottom">
            <div class="product-card__prices">
                <span class="product-card__discount"><span class="visually-hidden">Prezzo scontato </span>{{ $format->price($product['discountPriceCents']) }}</span>
                <s class="product-card__original"><span class="visually-hidden">Prezzo originale </span>{{ $format->price($product['originalPriceCents']) }}</s>
            </div>
            <div class="product-card__actions">
                <details class="product-card__details">
                    <summary class="button button--primary product-card__details-button"><span class="product-card__details-open">Scopri di più</span><span class="product-card__details-close">Nascondi dettagli</span><span class="visually-hidden"> su {{ $product['name'] }}</span></summary>
                    <p class="product-card__details-copy">{{ $test ? 'Scheda dimostrativa di uno strumento fittizio a scopo illustrativo.' : 'Scheda dimostrativa di un percorso formativo fittizio.' }} Il prodotto non è in vendita.</p>
                </details>
                <button type="button" disabled class="cart-square button--secondary" data-cart-add="{{ $product['id'] }}" aria-label="Aggiungi {{ $title }} al carrello"><x-icon name="cart" /></button>
            </div>
        </div>
    </div>
</article>
