<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * The shape of the site content, declared once as data, plus one recursive
 * function that validates and normalises against it.
 *
 * Field types:
 *   string    plain text (same in every language), e.g. brand name, phone
 *   text      translatable text → stored as { "en": "…", "de": "…" }
 *             A bare string is accepted and treated as English, so old content
 *             and hand-written JSON keep working.
 *   url       absolute http(s) URL, or "" when optional
 *   ref       http(s) URL or a site path beginning with "/" (images, media kit)
 *   email     email address
 *   enum      one of `values`; anything else (or nothing) becomes `default`
 *   list      array of objects described by `item`
 *   object    nested object described by `fields`
 *
 * Unknown keys are dropped; missing optional keys get defaults. The result is
 * always complete, so the frontend never receives `undefined` for a field.
 */
final class ContentValidator
{
    public const LANGUAGES = ['en', 'de'];

    /** @return array<string, array<string, mixed>> */
    public static function schema(): array
    {
        // Where a piece of work is from: shown on jeebhar.de (Europe), jeebhar.in
        // (India) or everywhere. jeebhar.com shows all of it.
        $region = ['type' => 'enum', 'values' => ['all', 'eu', 'in'], 'default' => 'all'];

        $reel = [
            'title' => ['type' => 'text', 'required' => true, 'max' => 160],
            'instagramUrl' => ['type' => 'url', 'required' => true],
            'thumbnailUrl' => ['type' => 'ref'],
            'region' => $region,
        ];

        return [
            'brandName' => ['type' => 'string', 'required' => true, 'max' => 80, 'default' => 'Jeebhar'],
            'heroEyebrow' => ['type' => 'text', 'max' => 160],
            'heroHeading' => ['type' => 'text', 'required' => true, 'max' => 300],
            'heroSubheading' => ['type' => 'text', 'required' => true, 'max' => 600],
            'heroImageUrl' => ['type' => 'ref'],
            // Search engines: the page <title> and meta description, per language.
            'seoTitle' => ['type' => 'text', 'max' => 70],
            'seoDescription' => ['type' => 'text', 'max' => 170],
            'mediaKitUrl' => ['type' => 'ref', 'default' => '/brand/media-kit.pdf'],
            'services' => ['type' => 'list', 'max' => 24, 'item' => [
                'title' => ['type' => 'text', 'required' => true, 'max' => 120],
                'shortDescription' => ['type' => 'text', 'required' => true, 'max' => 300],
                'longDescription' => ['type' => 'text', 'required' => true, 'max' => 3000],
            ]],
            'work' => ['type' => 'list', 'max' => 60, 'item' => [
                'title' => ['type' => 'text', 'required' => true, 'max' => 160],
                'imageUrl' => ['type' => 'ref', 'required' => true],
                'description' => ['type' => 'text', 'max' => 600],
                'region' => $region,
            ]],
            'reels' => ['type' => 'list', 'max' => 60, 'item' => $reel],
            'travelReels' => ['type' => 'list', 'max' => 60, 'item' => $reel],
            'mediaKitMetrics' => ['type' => 'list', 'max' => 12, 'item' => [
                'label' => ['type' => 'text', 'required' => true, 'max' => 120],
                'value' => ['type' => 'string', 'required' => true, 'max' => 40],
            ]],
            'contact' => ['type' => 'object', 'fields' => [
                'address' => ['type' => 'string', 'required' => true, 'max' => 300],
                'email' => ['type' => 'email', 'required' => true],
                'phone' => ['type' => 'string', 'required' => true, 'max' => 40],
                'facebookUrl' => ['type' => 'url'],
                'youtubeUrl' => ['type' => 'url'],
                'instagramUrl' => ['type' => 'url'],
                'tiktokUrl' => ['type' => 'url'],
            ]],
        ];
    }

    /** @var array<int, array{field: string, message: string}> */
    private array $errors = [];

    /**
     * @param array<string, mixed> $input
     * @return array<string, mixed>
     * @throws HttpError 400 with per-field details
     */
    public function validate(array $input): array
    {
        $this->errors = [];
        $clean = $this->object(self::schema(), $input, '');
        if ($this->errors !== []) {
            throw new HttpError(400, 'Validation failed.', $this->errors);
        }
        return $clean;
    }

    /**
     * Normalises without throwing — used on read so stored content written by an
     * older version always comes back complete.
     *
     * @param array<string, mixed> $input
     * @return array<string, mixed>
     */
    public function complete(array $input): array
    {
        $this->errors = [];
        return $this->object(self::schema(), $input, '');
    }

    /**
     * @param array<string, array<string, mixed>> $fields
     * @return array<string, mixed>
     */
    private function object(array $fields, mixed $input, string $path): array
    {
        $input = is_array($input) ? $input : [];
        $out = [];
        foreach ($fields as $key => $rule) {
            $out[$key] = $this->value($rule, $input[$key] ?? null, ltrim("$path.$key", '.'));
        }
        return $out;
    }

    /** @param array<string, mixed> $rule */
    private function value(array $rule, mixed $value, string $path): mixed
    {
        switch ($rule['type']) {
            case 'list':
                $items = is_array($value) ? array_values($value) : [];
                if (count($items) > $rule['max']) {
                    $this->fail($path, "At most {$rule['max']} items.");
                    $items = array_slice($items, 0, $rule['max']);
                }
                $out = [];
                foreach ($items as $index => $item) {
                    $clean = $this->object($rule['item'], $item, "$path.$index");
                    // Stable ids let the editor and React keep track of rows.
                    $id = is_array($item) && is_string($item['_id'] ?? null) && preg_match('/^[\w-]{1,40}$/', $item['_id'])
                        ? $item['_id']
                        : bin2hex(random_bytes(6));
                    $out[] = ['_id' => $id] + $clean;
                }
                return $out;

            case 'object':
                return $this->object($rule['fields'], $value, $path);

            case 'text':
                $source = is_array($value) ? $value : ['en' => $value];
                $out = [];
                foreach (self::LANGUAGES as $lang) {
                    $out[$lang] = $this->scalar($source[$lang] ?? '', $rule, "$path.$lang", $lang === 'en');
                }
                return $out;

            default:
                return $this->scalar($value ?? ($rule['default'] ?? ''), $rule, $path, true);
        }
    }

    /** @param array<string, mixed> $rule */
    private function scalar(mixed $value, array $rule, string $path, bool $enforceRequired): string
    {
        $text = is_scalar($value) ? trim((string) $value) : '';

        if ($rule['type'] === 'enum') {
            // Lenient on purpose: content from before the field existed, or a
            // typo, falls back to the default instead of blocking a save.
            return in_array($text, $rule['values'], true) ? $text : (string) $rule['default'];
        }

        if ($text === '') {
            if ($enforceRequired && !empty($rule['required'])) {
                $this->fail($path, 'This field is required.');
            }
            return '';
        }

        $max = $rule['max'] ?? 500;
        if (mb_strlen($text) > $max) {
            $this->fail($path, "Must be at most $max characters.");
        }

        switch ($rule['type']) {
            case 'url':
                if (!preg_match('#^https?://\S+$#i', $text)) {
                    $this->fail($path, 'Enter a full URL starting with https://');
                }
                break;
            case 'ref':
                if (!preg_match('#^(https?://\S+|/\S*)$#i', $text)) {
                    $this->fail($path, 'Enter an https:// URL or a path beginning with "/".');
                }
                break;
            case 'email':
                if (filter_var($text, FILTER_VALIDATE_EMAIL) === false) {
                    $this->fail($path, 'Enter a valid email address.');
                }
                break;
        }

        return $text;
    }

    private function fail(string $field, string $message): void
    {
        $this->errors[] = ['field' => $field, 'message' => $message];
    }
}
