<?php

declare(strict_types=1);

namespace App\Catalog;

use DateTimeImmutable;
use RuntimeException;

final class CatalogReader
{
    public const CATEGORIES = [
        'tutti' => 'Tutti',
        'clinica' => 'Clinica e Neuropsicologia',
        'scuola' => 'Scuola ed Età evolutiva',
        'lavoro' => 'Lavoro e Organizzazioni',
        'formazione' => 'Formazione',
    ];

    private const FORMATS = ['Digitale', 'Cartaceo', 'Corso online', 'In presenza'];

    public function list(): array
    {
        if (config('catalog.source') !== 'json') {
            throw new RuntimeException('Unsupported catalog source');
        }

        $path = config('catalog.path');
        if (!is_readable($path)) {
            throw new RuntimeException('Prepared catalog unavailable');
        }

        $rows = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        if (!is_array($rows) || !array_is_list($rows)) {
            throw new RuntimeException('Expected a list of catalog records');
        }

        $ids = [];
        foreach ($rows as $row) {
            if (!is_array($row) || !$this->valid($row) || isset($ids[$row['id']])) {
                throw new RuntimeException('Invalid or duplicate catalog record');
            }
            $ids[$row['id']] = true;
        }

        return $rows;
    }

    private function valid(array $row): bool
    {
        foreach (['id', 'name', 'creator', 'description'] as $field) {
            if (!is_string($row[$field] ?? null) || trim($row[$field]) === '') {
                return false;
            }
        }

        $id = $row['id'];
        $category = $row['categoryId'] ?? null;
        $original = $row['originalPriceCents'] ?? null;
        $discount = $row['discountPriceCents'] ?? null;
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $id) ||
            !is_string($category) || $category === 'tutti' || !isset(self::CATEGORIES[$category]) ||
            !in_array($row['format'] ?? null, self::FORMATS, true) ||
            !is_int($original) || !is_int($discount) || $discount < 1 || $original <= $discount ||
            $original > 9_007_199_254_740_991 || ($row['image'] ?? null) !== "/images/products/{$id}.webp" ||
            !array_key_exists('ageRange', $row) || !array_key_exists('startDate', $row)) {
            return false;
        }

        if (($row['kind'] ?? null) === 'test') {
            return is_string($row['ageRange']) && trim($row['ageRange']) !== '' && $row['startDate'] === null;
        }

        $date = $row['startDate'];
        return ($row['kind'] ?? null) === 'course' && $row['ageRange'] === null &&
            is_string($date) && preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date) &&
            ($parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date)) !== false &&
            $parsed->format('Y-m-d') === $date;
    }
}
