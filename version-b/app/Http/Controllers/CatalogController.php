<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Catalog\CatalogReader;
use App\Catalog\Presentation;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Log;
use Throwable;

final class CatalogController
{
    public function __invoke(CatalogReader $reader, Presentation $format): View
    {
        try {
            $products = $reader->list();
        } catch (Throwable) {
            Log::error('Catalogo non disponibile: controllare la sorgente e i dati.');
            $products = null;
        }

        return view('catalog', [
            'products' => $products,
            'categories' => CatalogReader::CATEGORIES,
            'format' => $format,
            'links' => [
                ['Test', 'catalogo', 'tutti'],
                ['Formazione', 'catalogo', 'formazione'],
                ['Risorse', 'guida', null],
                ['Contatti', 'contatti', null],
            ],
        ]);
    }
}
