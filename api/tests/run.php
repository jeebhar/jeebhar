<?php

/**
 * Dependency-free tests for the API's pure logic. Run: php api/tests/run.php
 * (CI runs this too.) Exit code is non-zero on the first failure.
 */

declare(strict_types=1);

require_once __DIR__ . '/../src/bootstrap.php';

use Jeebhar\ContentValidator;
use Jeebhar\HttpError;

$failures = 0;
$test = static function (string $name, callable $body) use (&$failures): void {
    try {
        $body();
        echo "  ok  $name\n";
    } catch (Throwable $error) {
        $failures++;
        echo "  FAIL $name — {$error->getMessage()}\n";
    }
};
$assert = static function (bool $condition, string $message): void {
    if (!$condition) {
        throw new RuntimeException($message);
    }
};

$seed = json_decode((string) file_get_contents(__DIR__ . '/../seed/default-content.json'), true);

$test('seed content passes validation', function () use ($seed, $assert) {
    $clean = (new ContentValidator())->validate($seed);
    $assert(count($clean['services']) === 4, 'expected 4 services');
});

$test('seed has German text for every English hero field', function () use ($seed, $assert) {
    foreach (['heroEyebrow', 'heroHeading', 'heroSubheading'] as $key) {
        $assert($seed[$key]['de'] !== '', "$key.de is empty");
    }
});

$test('a bare string is accepted as English and German defaults to empty', function () use ($seed, $assert) {
    $seed['heroHeading'] = 'Plain heading';
    $clean = (new ContentValidator())->validate($seed);
    $assert($clean['heroHeading'] === ['en' => 'Plain heading', 'de' => ''], 'not normalised');
});

$test('English is required, German is optional', function () use ($seed, $assert) {
    $seed['services'][0]['title'] = ['en' => '', 'de' => 'Nur Deutsch'];
    try {
        (new ContentValidator())->validate($seed);
        $assert(false, 'should have thrown');
    } catch (HttpError $error) {
        $assert($error->details[0]['field'] === 'services.0.title.en', 'wrong field: ' . $error->details[0]['field']);
    }
});

$test('relative and absolute image refs are allowed, other strings are not', function () use ($seed, $assert) {
    $seed['work'][0]['imageUrl'] = '/uploads/a.jpg';
    (new ContentValidator())->validate($seed);
    $seed['work'][0]['imageUrl'] = 'javascript:alert(1)';
    try {
        (new ContentValidator())->validate($seed);
        $assert(false, 'should have thrown');
    } catch (HttpError $error) {
        $assert($error->details[0]['field'] === 'work.0.imageUrl', 'wrong field');
    }
});

$test('unknown keys are dropped and missing items get ids', function () use ($seed, $assert) {
    $seed['evil'] = 'x';
    unset($seed['work'][0]['_id']);
    $clean = (new ContentValidator())->validate($seed);
    $assert(!isset($clean['evil']), 'unknown key kept');
    $assert(strlen($clean['work'][0]['_id']) === 12, 'no id generated');
});

$test('complete() fills a fully empty document without throwing', function () use ($assert) {
    $clean = (new ContentValidator())->complete([]);
    $assert($clean['mediaKitUrl'] === '/brand/media-kit.pdf', 'default missing');
    $assert($clean['reels'] === [], 'reels not empty');
});

echo $failures === 0 ? "All API tests passed.\n" : "$failures test(s) failed.\n";
exit($failures === 0 ? 0 : 1);
