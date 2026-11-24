<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * Fixed-window rate limiter backed by small files — shared hosting has no Redis.
 * IPs are hashed, so the directory never holds raw addresses.
 */
final class RateLimiter
{
    private string $dir;

    public function __construct(string $dir)
    {
        $this->dir = $dir;
    }

    /** Records one hit and throws 429 once `$max` hits fall inside `$windowSeconds`. */
    public function hit(string $bucket, string $ip, int $max, int $windowSeconds): void
    {
        if (!is_dir($this->dir) && !@mkdir($this->dir, 0700, true) && !is_dir($this->dir)) {
            return; // Fail open: a missing directory must not block real visitors.
        }

        $file = $this->dir . '/' . $bucket . '-' . hash('sha256', $ip) . '.json';
        $now = time();

        $handle = fopen($file, 'c+');
        if ($handle === false) {
            return;
        }
        flock($handle, LOCK_EX);
        $hits = json_decode((string) stream_get_contents($handle), true);
        $hits = array_values(array_filter(
            is_array($hits) ? $hits : [],
            static fn ($time) => is_int($time) && $time > $now - $windowSeconds
        ));

        $limited = count($hits) >= $max;
        if (!$limited) {
            $hits[] = $now;
        }

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($hits));
        flock($handle, LOCK_UN);
        fclose($handle);

        if ($limited) {
            throw new HttpError(429, 'Too many requests. Please wait a few minutes and try again.');
        }
    }
}
