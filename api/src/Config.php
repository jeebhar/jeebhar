<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * Read-only view of api/config.php.
 *
 * config.php is GENERATED from the repository's single `jeebhar.config.json`
 * by `npm run build:bluehost` (or `npm run config:dev`). Never edit it by hand.
 * It is a .php file on purpose: if the web server were ever misconfigured, a
 * PHP file executes instead of printing its secrets.
 */
final class Config
{
    /** @var array<string, mixed> */
    private array $values;

    private string $baseDir;

    /** @param array<string, mixed> $values */
    private function __construct(array $values, string $baseDir)
    {
        $this->values = $values;
        $this->baseDir = $baseDir;
    }

    public static function load(string $file): self
    {
        $values = is_file($file) ? require $file : [];
        if (!is_array($values)) {
            $values = [];
        }
        return new self($values, dirname($file));
    }

    /** @param array<string, mixed> $values For tests. */
    public static function fromArray(array $values, string $baseDir): self
    {
        return new self($values, $baseDir);
    }

    /** Dotted lookup: get('mail.smtp.host'). */
    public function get(string $path, mixed $default = null): mixed
    {
        $node = $this->values;
        foreach (explode('.', $path) as $key) {
            if (!is_array($node) || !array_key_exists($key, $node)) {
                return $default;
            }
            $node = $node[$key];
        }
        return $node;
    }

    public function string(string $path, string $default = ''): string
    {
        $value = $this->get($path, $default);
        return is_scalar($value) ? trim((string) $value) : $default;
    }

    public function int(string $path, int $default): int
    {
        $value = $this->get($path, $default);
        return is_numeric($value) ? (int) $value : $default;
    }

    /** Where content.json, enquiries and rate-limit files live. Outside public_html in production. */
    public function dataDir(): string
    {
        return $this->resolve($this->string('paths.dataDir', 'data'));
    }

    /** Where uploaded images and documents are written (must be web-served). */
    public function uploadsDir(): string
    {
        return $this->resolve($this->string('paths.uploadsDir', '../uploads'));
    }

    /** The public URL prefix of uploadsDir. */
    public function uploadsUrl(): string
    {
        return rtrim($this->string('paths.uploadsUrl', '/uploads'), '/');
    }

    /** Relative paths are resolved against the api/ directory. */
    private function resolve(string $path): string
    {
        $isAbsolute = $path !== '' && ($path[0] === '/' || preg_match('/^[A-Za-z]:[\\\\\/]/', $path) === 1);
        return rtrim($isAbsolute ? $path : $this->baseDir . '/' . $path, '/');
    }
}
