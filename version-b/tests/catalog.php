<?php

declare(strict_types=1);

use App\Catalog\CatalogReader;
use App\Catalog\Presentation;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
config(['catalog.source' => 'json', 'session.driver' => 'array', 'cache.default' => 'array']);
config(['app.key' => 'base64:'.base64_encode(random_bytes(32))]);

function check(bool $condition, string $description): void
{
    if (!$condition) {
        throw new RuntimeException($description);
    }
    echo "PASS $description\n";
}

$reader = $app->make(CatalogReader::class);
$products = $reader->list();
$canonical = json_decode(file_get_contents(__DIR__.'/../../specs/products.json'), true, flags: JSON_THROW_ON_ERROR);
check($products === $canonical && count($products) === 8, 'Canonical records and order');
check(count(array_unique(array_column($products, 'categoryId'))) === 4, 'Catalog spans four categories');

$fixture = tempnam(sys_get_temp_dir(), 'giunti-catalog-');
try {
    config(['catalog.path' => $fixture]);
    $invalidRows = [
        [...$products, $products[0]],
        [array_replace($products[0], ['discountPriceCents' => $products[0]['originalPriceCents']])],
        [array_replace($products[0], ['image' => '/invalid.webp'])],
        [array_replace($products[0], ['categoryId' => 'tutti'])],
        [array_replace($products[0], ['kind' => 'course', 'ageRange' => null, 'startDate' => '2027-02-30'])],
    ];
    foreach ($invalidRows as $index => $rows) {
        file_put_contents($fixture, json_encode($rows, JSON_THROW_ON_ERROR));
        $rejected = false;
        try {
            $reader->list();
        } catch (RuntimeException) {
            $rejected = true;
        }
        check($rejected, 'Reject invalid fixture '.($index + 1));
    }
} finally {
    unlink($fixture);
    config(['catalog.path' => base_path('build/products.json')]);
}

$format = new Presentation;
check($format->price(125099) === "1.250,99\u{00A0}€", 'Localized euro formatting');
check($format->date('2027-04-22') === '22 aprile 2027', 'Localized date without timezone shift');

$landing = $app->handle(Request::create('/'));
check($landing->getStatusCode() === 200 && substr_count($landing->getContent(), 'data-product="') === 8, 'Laravel landing renders eight cards');
check($app->handle(Request::create('/up'))->getStatusCode() === 200, 'Railway health check route');
config(['catalog.source' => 'supabase']);
$unavailable = $app->handle(Request::create('/'));
check($unavailable->getStatusCode() === 200 && str_contains($unavailable->getContent(), 'Il catalogo non è disponibile'), 'Unavailable catalog keeps the landing available');
