<dialog id="cart-drawer" class="cart-drawer" aria-modal="true" aria-labelledby="cart-title">
    <div class="cart-drawer__layout">
        <div class="cart-drawer__heading">
            <div>
                <h2 id="cart-title" class="cart-drawer__title">Il tuo carrello</h2>
                <p class="cart-drawer__units" data-cart-units>0 articoli</p>
            </div>
            <button type="button" class="icon-button" aria-label="Chiudi carrello" data-cart-close><x-icon name="close" /></button>
        </div>
        <p role="status" class="visually-hidden" data-cart-status></p>
        <div class="cart-drawer__scroll">
            <ul aria-label="Prodotti nel carrello" data-cart-lines hidden></ul>
            <div class="cart-drawer__empty" data-cart-empty>
                <span class="cart-drawer__empty-icon"><x-icon name="cart" :size="28" /></span>
                <h3 class="cart-drawer__empty-title">Il tuo carrello è vuoto</h3>
                <p class="cart-drawer__muted">Esplora il catalogo e aggiungi i prodotti che ti interessano.</p>
                <button type="button" class="button button--secondary" data-cart-explore>Esplora il catalogo</button>
            </div>
        </div>
        <div class="cart-drawer__bottom">
            <div class="cart-drawer__subtotal"><span>Subtotale</span><span data-cart-subtotal>{{ $format->price(0) }}</span></div>
            <p class="cart-drawer__muted">Carrello dimostrativo. Gli acquisti non sono disponibili in questa versione.</p>
            <button type="button" class="button button--primary cart-drawer__action" data-cart-dismiss>Continua a esplorare</button>
            <button type="button" class="button button--secondary cart-drawer__action" data-cart-clear hidden>Svuota carrello</button>
        </div>
    </div>
</dialog>
@php
    $cartFields = array_flip(['id', 'name', 'format', 'image', 'discountPriceCents']);
    $cartProducts = array_map(fn ($product) => array_intersect_key($product, $cartFields), $products ?? []);
@endphp
<script type="application/json" id="cart-products">@json($cartProducts)</script>
<template id="cart-line">
    <li class="cart-line">
        <img class="cart-line__image" width="80" height="48" alt="">
        <div class="cart-line__body">
            <h3 class="cart-line__name" data-line-name></h3>
            <p class="cart-line__info" data-line-format></p>
            <p class="cart-line__info" data-line-unit></p>
            <div class="cart-line__quantity" role="group" data-line-controls>
                <button type="button" class="cart-square button--secondary" data-line-action="decrease"><x-icon name="minus" :size="16" /></button>
                <span class="cart-line__count" data-line-count></span>
                <button type="button" class="cart-square button--secondary" data-line-action="add"><x-icon name="plus" :size="16" /></button>
                <button type="button" class="icon-button" data-line-action="remove"><x-icon name="trash" :size="18" /></button>
            </div>
            <p class="cart-line__total"><span class="visually-hidden">Totale prodotto: </span><span data-line-total></span></p>
        </div>
    </li>
</template>
