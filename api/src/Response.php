<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * Writes the API's single response envelope and ends the request.
 *
 *   success  { "ok": true,  "data": …, "message"?: … }
 *   failure  { "ok": false, "message": …, "details"?: [{ field, message }] }
 *
 * Same shape the React client already expects, so the frontend did not change
 * when the backend moved from Node to PHP.
 */
final class Response
{
    public static function json(int $status, mixed $data, ?string $message = null): never
    {
        $body = ['ok' => true, 'data' => $data];
        if ($message !== null) {
            $body['message'] = $message;
        }
        self::send($status, $body);
    }

    /** @param array<int, array{field: string, message: string}> $details */
    public static function error(int $status, string $message, array $details = []): never
    {
        $body = ['ok' => false, 'message' => $message];
        if ($details !== []) {
            $body['details'] = $details;
        }
        self::send($status, $body);
    }

    public static function noContent(): never
    {
        http_response_code(204);
        exit;
    }

    /**
     * The site and API share an origin on Bluehost, so CORS only matters for
     * local development (Vite on :5173). Allowed origins come from config.
     */
    public static function applyCors(Config $config, Request $request): void
    {
        $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
        $allowed = $config->get('cors.allowedOrigins', []);
        if ($origin !== '' && is_array($allowed) && in_array($origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token');
        }
    }

    /** @param array<string, mixed> $body */
    private static function send(int $status, array $body): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}
