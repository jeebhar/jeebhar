<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * Saves an admin upload into public_html/uploads and returns its public URL.
 *
 * The file type is decided by inspecting the bytes, never by trusting the name
 * or the browser's Content-Type, and the stored name is generated — so an
 * upload can never become an executable script. uploads/.htaccess additionally
 * switches off PHP for that folder.
 */
final class UploadService
{
    /** Detected MIME type → extension. */
    private const ALLOWED = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'application/pdf' => 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        'application/msword' => 'doc',
    ];

    private Config $config;

    public function __construct(Config $config)
    {
        $this->config = $config;
    }

    /**
     * The file's real type, from its bytes.
     *
     * Uses the fileinfo extension when it is enabled, otherwise reads the
     * file's signature directly — fileinfo is off in a fresh Windows PHP
     * install, and uploads must still work there.
     */
    private static function detectType(string $path): string
    {
        if (class_exists(\finfo::class)) {
            return (new \finfo(FILEINFO_MIME_TYPE))->file($path) ?: '';
        }

        $head = (string) file_get_contents($path, false, null, 0, 16);
        $signatures = [
            "\xFF\xD8\xFF" => 'image/jpeg',
            "\x89PNG\r\n\x1A\n" => 'image/png',
            'GIF87a' => 'image/gif',
            'GIF89a' => 'image/gif',
            '%PDF-' => 'application/pdf',
            "PK\x03\x04" => 'application/zip',
            "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1" => 'application/msword',
        ];
        foreach ($signatures as $magic => $type) {
            if (strncmp($head, $magic, strlen($magic)) === 0) {
                return $type;
            }
        }
        if (strncmp($head, 'RIFF', 4) === 0 && substr($head, 8, 4) === 'WEBP') {
            return 'image/webp';
        }
        return '';
    }

    /** @param array<string, mixed>|null $file one entry of $_FILES */
    public function store(?array $file): string
    {
        if ($file === null || !isset($file['error'])) {
            throw new HttpError(400, 'Choose a file to upload.');
        }
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
            throw new HttpError(413, 'That file is larger than the server allows.');
        }
        if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file((string) $file['tmp_name'])) {
            throw new HttpError(400, 'The upload did not complete. Please try again.');
        }

        $maxBytes = $this->config->int('uploads.maxMegabytes', 10) * 1024 * 1024;
        if ((int) $file['size'] > $maxBytes) {
            throw new HttpError(413, 'Files may be at most ' . ($maxBytes / 1048576) . ' MB.');
        }

        $mime = self::detectType((string) $file['tmp_name']);
        // .docx is a zip; finfo on some hosts only reports that.
        if ($mime === 'application/zip' && preg_match('/\.docx$/i', (string) $file['name'])) {
            $mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        if (!isset(self::ALLOWED[$mime])) {
            throw new HttpError(415, 'Only JPG, PNG, WebP, GIF, PDF and Word files can be uploaded.');
        }

        $dir = $this->config->uploadsDir();
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            throw new \RuntimeException("Cannot create uploads directory $dir");
        }

        $base = strtolower(pathinfo((string) $file['name'], PATHINFO_FILENAME));
        $base = trim(preg_replace('/[^a-z0-9]+/', '-', $base) ?? '', '-') ?: 'file';
        $name = substr($base, 0, 40) . '-' . bin2hex(random_bytes(4)) . '.' . self::ALLOWED[$mime];

        if (!move_uploaded_file((string) $file['tmp_name'], "$dir/$name")) {
            throw new \RuntimeException('move_uploaded_file failed');
        }
        @chmod("$dir/$name", 0644);

        return $this->config->uploadsUrl() . '/' . $name;
    }
}
