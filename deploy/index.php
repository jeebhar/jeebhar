<?php

declare(strict_types=1);

/**
 * public_html/index.php — every page request (not files, not /api) lands here,
 * including /robots.txt and /sitemap.xml, which are generated per domain.
 *
 * Reads the built index.html and serves it with the domain's language, SEO
 * tags and a crawlable copy of the content filled in (see
 * api/src/PageRenderer.php). Copied into place by `npm run build:bluehost`.
 *
 * If anything goes wrong, the plain index.html is served instead: the React
 * app still works, only the SEO additions are missing for that request.
 */

require_once __DIR__ . '/api/src/bootstrap.php';

use Jeebhar\Config;
use Jeebhar\ContentRepository;
use Jeebhar\PageRenderer;

$template = (string) @file_get_contents(__DIR__ . '/index.html');
$host = (string) ($_SERVER['HTTP_HOST'] ?? '');
$path = (string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);

try {
    $config = Config::load(__DIR__ . '/api/config.php');
    $domains = $config->get('domains', []);
    $renderer = new PageRenderer(is_array($domains) ? $domains : []);

    // robots.txt and sitemap.xml are generated per domain.
    if ($path === '/robots.txt') {
        header('Content-Type: text/plain; charset=utf-8');
        echo $renderer->robots($host);
        exit;
    }
    if ($path === '/sitemap.xml') {
        $stored = $config->dataDir() . '/content.json';
        $changed = is_file($stored) ? filemtime($stored) : filemtime(__DIR__ . '/api/seed/default-content.json');
        header('Content-Type: application/xml; charset=utf-8');
        echo $renderer->sitemap($host, date('Y-m-d', $changed ?: time()));
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache');
    $content = (new ContentRepository($config->dataDir(), __DIR__ . '/api/seed/default-content.json'))->get();

    $page = $renderer->render(
        $template,
        $content,
        $host,
        (string) ($_SERVER['REQUEST_URI'] ?? '/')
    );

    http_response_code($page['status']);
    echo $page['html'];
} catch (Throwable $error) {
    error_log('[jeebhar] page render failed: ' . $error);
    echo $template;
}
