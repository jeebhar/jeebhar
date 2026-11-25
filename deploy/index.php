<?php

declare(strict_types=1);

/**
 * public_html/index.php — every page request (not files, not /api) lands here.
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

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');

try {
    $config = Config::load(__DIR__ . '/api/config.php');
    $content = (new ContentRepository($config->dataDir(), __DIR__ . '/api/seed/default-content.json'))->get();
    $domains = $config->get('domains', []);

    $page = (new PageRenderer(is_array($domains) ? $domains : []))->render(
        $template,
        $content,
        (string) ($_SERVER['HTTP_HOST'] ?? ''),
        (string) ($_SERVER['REQUEST_URI'] ?? '/')
    );

    http_response_code($page['status']);
    echo $page['html'];
} catch (Throwable $error) {
    error_log('[jeebhar] page render failed: ' . $error);
    echo $template;
}
