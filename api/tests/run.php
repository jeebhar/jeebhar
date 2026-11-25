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

// ---------------------------------------------------------------- PageRenderer

$domains = [
    'primary' => 'jeebhar.com',
    'sites' => [
        ['host' => 'jeebhar.com', 'defaultLanguage' => 'en'],
        ['host' => 'jeebhar.in', 'defaultLanguage' => 'en'],
        ['host' => 'jeebhar.de', 'defaultLanguage' => 'de'],
    ],
];
$template = '<!doctype html><html lang="en"><head><title>Old</title>'
    . "<meta\n name=\"description\"\n content=\"old\" />"
    . '<meta property="og:title" content="old" /></head><body><div id="root"></div></body></html>';
$page = static fn (string $host, string $path = '/') =>
    (new Jeebhar\PageRenderer($domains))->render($template, (new ContentValidator())->complete($seed), $host, $path);

$test('jeebhar.de is served in German with the German title', function () use ($page, $assert) {
    $html = $page('www.jeebhar.de')['html'];
    $assert(str_contains($html, '<html lang="de">'), 'lang not de');
    $assert(str_contains($html, '<title>Jeebhar | Social-Media-Agentur'), 'German title missing');
    $assert(str_contains($html, '<h2>Unsere Leistungen</h2>'), 'German snapshot missing');
});

$test('the static English tags of index.html are replaced, not duplicated', function () use ($page, $assert) {
    $html = $page('jeebhar.de')['html'];
    $assert(substr_count($html, '<title>') === 1, 'title count');
    $assert(!str_contains($html, 'content="old"'), 'old meta left in');
    $assert(substr_count($html, 'name="description"') === 1, 'description count');
});

$test('every domain links to all three versions and to x-default', function () use ($page, $assert) {
    $html = $page('jeebhar.in')['html'];
    foreach (['hreflang="en" href="https://jeebhar.com/"', 'hreflang="en-IN" href="https://jeebhar.in/"', 'hreflang="de" href="https://jeebhar.de/"', 'hreflang="x-default" href="https://jeebhar.com/"'] as $link) {
        $assert(str_contains($html, $link), "missing $link");
    }
    $assert(str_contains($html, '<link rel="canonical" href="https://jeebhar.in/" />'), 'canonical');
});

$test('an unknown host (Bluehost temp domain) behaves as the primary', function () use ($page, $assert) {
    $html = $page('xwl.oee.mybluehost.me')['html'];
    $assert(str_contains($html, '<link rel="canonical" href="https://jeebhar.com/" />'), 'canonical not primary');
});

$test('the business is described as JSON-LD with socials and services', function () use ($page, $assert) {
    $html = $page('jeebhar.com')['html'];
    $assert(preg_match('#<script type="application/ld\+json">(.*?)</script>#s', $html, $m) === 1, 'no JSON-LD');
    $data = json_decode($m[1], true);
    $org = $data['@graph'][0];
    $assert($org['@type'] === 'ProfessionalService', 'type');
    $assert(in_array('https://www.instagram.com/jeebhar/', $org['sameAs'], true), 'instagram sameAs');
    $assert(count($org['hasOfferCatalog']['itemListElement']) === 4, 'services');
    $assert($org['address']['addressLocality'] === 'Offenbach', 'address');
});

$test('the content is embedded for the app, and cannot break out of its script', function () use ($seed, $domains, $template, $assert) {
    $evil = $seed;
    $evil['heroHeading'] = ['en' => '</script><script>alert(1)</script>', 'de' => ''];
    $html = (new Jeebhar\PageRenderer($domains))->render($template, (new ContentValidator())->complete($evil), 'jeebhar.com', '/')['html'];
    $assert(!str_contains($html, '<script>alert(1)'), 'script injection');
    $assert(str_contains($html, '<script id="jeebhar-content" type="application/json">'), 'embedded content');
    $assert(str_contains($html, '&lt;/script&gt;&lt;script&gt;alert(1)'), 'snapshot not escaped');
});

$test('unknown paths are 404 and noindex', function () use ($page, $assert) {
    $result = $page('jeebhar.com', '/does-not-exist');
    $assert($result['status'] === 404, 'status');
    $assert(str_contains($result['html'], 'name="robots" content="noindex"'), 'noindex');
    $assert($page('jeebhar.com', '/?utm_source=x')['status'] === 200, 'query string on home');
});

echo $failures === 0 ? "All API tests passed.\n" : "$failures test(s) failed.\n";
exit($failures === 0 ? 0 : 1);
