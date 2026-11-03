<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * Stores the site content as one JSON file.
 *
 * The whole site is a single document edited by one admin, so a database would
 * add cost and nothing else. Writes go to a temp file and are renamed into
 * place, which is atomic: a visitor never reads half-written content.
 * The previous version is kept as content.previous.json as a one-step undo.
 */
final class ContentRepository
{
    private string $file;

    private string $seedFile;

    public function __construct(string $dataDir, string $seedFile)
    {
        $this->file = $dataDir . '/content.json';
        $this->seedFile = $seedFile;
    }

    /** @return array<string, mixed> */
    public function get(): array
    {
        $source = is_file($this->file) ? $this->file : $this->seedFile;
        $data = json_decode((string) @file_get_contents($source), true);
        return (new ContentValidator())->complete(is_array($data) ? $data : []);
    }

    /**
     * @param array<string, mixed> $content already validated
     * @return array<string, mixed>
     */
    public function save(array $content): array
    {
        $dir = dirname($this->file);
        if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
            throw new \RuntimeException("Cannot create data directory $dir");
        }

        if (is_file($this->file)) {
            @copy($this->file, $dir . '/content.previous.json');
        }

        $temp = $this->file . '.' . bin2hex(random_bytes(4)) . '.tmp';
        $json = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($json === false || file_put_contents($temp, $json, LOCK_EX) === false || !rename($temp, $this->file)) {
            @unlink($temp);
            throw new \RuntimeException('Could not write content.json');
        }

        return $content;
    }
}
