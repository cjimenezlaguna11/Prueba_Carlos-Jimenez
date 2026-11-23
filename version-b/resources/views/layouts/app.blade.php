<!doctype html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Esplora il catalogo dimostrativo di strumenti di assessment e corsi per professionisti della psicologia.">
    <meta name="robots" content="noindex, nofollow">
    <title>Catalogo dimostrativo | Giunti Psychometrics Italia</title>
    @include('layouts.appearance')
    <link rel="icon" href="/giunti-psychometrics.png" type="image/png">
    <link rel="preload" href="/build/inter.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="{{ asset('build/app.css') }}">
    <script src="{{ asset('build/app.js') }}" defer></script>
</head>
<body>
    <a class="skip-link" href="#contenuto">Vai al contenuto</a>
    @include('sections.header')
    <main id="contenuto" tabindex="-1">
        @yield('content')
    </main>
    @include('sections.footer')
    <p role="status" class="cart-notice visually-hidden" data-cart-notice></p>
</body>
</html>
