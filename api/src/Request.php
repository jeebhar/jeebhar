<?php

declare(strict_types=1);

namespace Jeebhar;

/** The incoming request, read once from PHP's globals. */
final class Request
{
    public string $method;

    /** Path below /api, e.g. "/content". */
    public string $path;

    public string $ip;

    private function __construct(string $method, string $path, string $ip)
    {
        $this->method = $method;
        $this->path = $path;
        $this->ip = $ip;
    }

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

        // Everything after the last "/api" segment is the route.
        $position = strrpos($uri, '/api');
        $path = $position === false ? $uri : substr($uri, $position + 4);
        $path = '/' . trim($path, '/');

        return new self($method, $path, (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'));
    }

    /** @return array<string, mixed> */
    public function json(): array
    {
        $raw = file_get_contents('php://input') ?: '';
        if (strlen($raw) > 512 * 1024) {
            throw new HttpError(413, 'Request body is too large.');
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new HttpError(400, 'Request body must be valid JSON.');
        }
        return $data;
    }

    /**
     * Checks the admin token in constant time.
     *
     * Accepts `Authorization: Bearer …` or `X-Admin-Token: …`. The second exists
     * because some shared hosts strip the Authorization header before PHP sees it.
     * Failed attempts are rate limited per IP to stop token guessing.
     */
    public function requireAdmin(Config $config, RateLimiter $limiter): void
    {
        $expected = $config->string('admin.token');
        if ($expected === '' || strlen($expected) < 16) {
            throw new HttpError(503, 'Admin editing is disabled: set admin.token (16+ characters) in jeebhar.config.json.');
        }

        $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        $token = preg_match('/^Bearer\s+(.+)$/i', $header, $match) === 1
            ? trim($match[1])
            : trim((string) ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ''));

        if ($token === '') {
            throw new HttpError(401, 'Admin token missing.');
        }
        if (!hash_equals($expected, $token)) {
            $limiter->hit('auth-fail', $this->ip, 10, 900);
            throw new HttpError(403, 'Admin token is not valid.');
        }
    }
}
