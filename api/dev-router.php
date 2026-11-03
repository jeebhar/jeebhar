<?php

/**
 * Router for PHP's built-in web server — local development only.
 *
 *   php -S localhost:5000 api/dev-router.php
 *
 * Mirrors what Apache's .htaccess does on Bluehost: /api/* → api/index.php and
 * /uploads/* → the uploads folder. Vite proxies both paths here.
 */
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

require_once __DIR__ . '/src/bootstrap.php';
$config = Jeebhar\Config::load(__DIR__ . '/config.php');

if (str_starts_with($path, $config->uploadsUrl() . '/')) {
    $file = $config->uploadsDir() . '/' . basename($path);
    if (is_file($file)) {
        header('Content-Type: ' . (mime_content_type($file) ?: 'application/octet-stream'));
        readfile($file);
        return true;
    }
    http_response_code(404);
    return true;
}

require __DIR__ . '/index.php';
