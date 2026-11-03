<?php

declare(strict_types=1);

/**
 * Front controller for the Jeebhar API.
 *
 * Apache rewrites every /api/* request here (see api/.htaccess). This file only
 * wires the pieces together and picks a route — each route's logic lives in one
 * class under src/, so there is exactly one place to look for any behaviour.
 *
 *   GET  /api/health    liveness probe
 *   GET  /api/content   public site content (both languages)
 *   PUT  /api/content   replace site content          (admin token)
 *   POST /api/contact   contact form → stored + emailed
 *   POST /api/upload    image / media-kit upload       (admin token)
 */

require_once __DIR__ . '/src/bootstrap.php';

use Jeebhar\Config;
use Jeebhar\ContactService;
use Jeebhar\ContentRepository;
use Jeebhar\ContentValidator;
use Jeebhar\HttpError;
use Jeebhar\Mailer;
use Jeebhar\RateLimiter;
use Jeebhar\Request;
use Jeebhar\Response;
use Jeebhar\UploadService;

$config = Config::load(__DIR__ . '/config.php');
date_default_timezone_set($config->string('site.timezone', 'Europe/Berlin'));
$request = Request::fromGlobals();
$limiter = new RateLimiter($config->dataDir() . '/ratelimit');

Response::applyCors($config, $request);

try {
    if ($request->method === 'OPTIONS') {
        Response::noContent();
    }

    $route = $request->method . ' ' . $request->path;

    switch ($route) {
        case 'GET /health':
            Response::json(200, ['status' => 'ok', 'php' => PHP_VERSION]);

        case 'GET /content':
            $content = (new ContentRepository($config->dataDir(), __DIR__ . '/seed/default-content.json'))->get();
            Response::json(200, $content);

        case 'PUT /content':
            $request->requireAdmin($config, $limiter);
            $clean = (new ContentValidator())->validate($request->json());
            $saved = (new ContentRepository($config->dataDir(), __DIR__ . '/seed/default-content.json'))->save($clean);
            Response::json(200, $saved, 'Content saved.');

        case 'POST /contact':
            $limiter->hit('contact', $request->ip, $config->int('rateLimit.contactPer15Min', 5), 900);
            $result = (new ContactService($config, Mailer::fromConfig($config)))->submit($request->json(), $request->ip);
            Response::json(201, $result, 'Thanks — your enquiry has been received.');

        case 'POST /upload':
            $request->requireAdmin($config, $limiter);
            $url = (new UploadService($config))->store($_FILES['file'] ?? null);
            Response::json(201, ['url' => $url], 'File uploaded.');

        default:
            throw new HttpError(404, 'No such endpoint.');
    }
} catch (HttpError $error) {
    Response::error($error->status, $error->getMessage(), $error->details);
} catch (Throwable $error) {
    // The real cause goes to the log; the visitor gets a generic message.
    error_log('[jeebhar] ' . $error);
    Response::error(500, 'Something went wrong on our side. Please try again.');
}
