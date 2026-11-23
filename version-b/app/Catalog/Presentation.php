<?php

declare(strict_types=1);

namespace App\Catalog;

use IntlDateFormatter;

final class Presentation
{
    private IntlDateFormatter $dates;

    public function __construct()
    {
        $this->dates = new IntlDateFormatter('it_IT', IntlDateFormatter::LONG, IntlDateFormatter::NONE, 'UTC');
    }

    public function price(int $cents): string
    {
        $whole = number_format(intdiv($cents, 100), 0, ',', '.');
        $fraction = str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
        return "$whole,$fraction\u{00A0}€";
    }

    public function date(string $date): string
    {
        return $this->dates->format(new \DateTimeImmutable($date.'T00:00:00Z'));
    }
}
