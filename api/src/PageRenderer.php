<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * Turns the built index.html into a complete, crawlable page for one domain.
 *
 * The React app renders in the browser, which leaves search engines and link
 * previews (WhatsApp, LinkedIn, Bing) with an almost empty page. Before the
 * HTML leaves the server this class adds:
 *
 *   - <html lang>, <title>, meta description: in the domain's language
 *   - canonical + hreflang links: jeebhar.de / .in / .com are one site in
 *     different languages, not three copies (no duplicate content)
 *   - Open Graph / Twitter tags: proper previews when a link is shared
 *   - JSON-LD: the business, its services, areas and social profiles
 *   - a plain-HTML snapshot of the page inside #root: headings, services,
 *     numbers, work, reels, contact. React replaces it on load; crawlers and
 *     visitors without JavaScript read it as is.
 *   - the content itself as JSON, so the app starts without an API call
 *
 * Pure input → output (no globals), so it is tested directly.
 */
final class PageRenderer
{
    /** Section headings for the snapshot, per language. */
    private const LABELS = [
        'en' => [
            'services' => 'Our Services', 'experience' => 'Our Experience', 'work' => 'Our Work',
            'reels' => 'Our Reels', 'travel' => 'Travel Reels', 'contact' => 'Contact Us',
            'mediaKit' => 'Media Kit', 'follow' => 'Follow us',
        ],
        'de' => [
            'services' => 'Unsere Leistungen', 'experience' => 'Unsere Erfahrung', 'work' => 'Unsere Arbeit',
            'reels' => 'Unsere Reels', 'travel' => 'Reise-Reels', 'contact' => 'Kontakt',
            'mediaKit' => 'Media Kit', 'follow' => 'Folgen Sie uns',
        ],
    ];

    private const OG_LOCALE = ['de' => 'de_DE', 'en' => 'en_US', 'en-IN' => 'en_IN'];

    /** What the business is about, for search engines (schema.org knowsAbout). */
    private const TOPICS = [
        'Social media marketing', 'User-generated content (UGC)', 'Product marketing',
        'Influencer marketing', 'Content creation', 'Social media advertising',
        'Food content', 'Travel content', 'Lifestyle content',
    ];

    private const AREAS = [
        ['@type' => 'Country', 'name' => 'Germany'],
        ['@type' => 'Place', 'name' => 'Europe'],
        ['@type' => 'Country', 'name' => 'India'],
    ];

    /** @var array<int, array{host: string, lang: string, hreflang: string, region: string}> */
    private array $sites;

    private string $primary;

    /** @param array<string, mixed> $domains `domains` from jeebhar.config.json */
    public function __construct(array $domains)
    {
        $this->primary = strtolower((string) ($domains['primary'] ?? 'jeebhar.com'));
        $this->sites = [];
        foreach ((array) ($domains['sites'] ?? []) as $site) {
            $host = strtolower(trim((string) ($site['host'] ?? '')));
            if ($host === '') {
                continue;
            }
            $lang = ($site['defaultLanguage'] ?? 'en') === 'de' ? 'de' : 'en';
            $this->sites[] = [
                'host' => $host,
                'lang' => $lang,
                'hreflang' => (string) ($site['hreflang'] ?? self::defaultHreflang($host, $lang)),
                'region' => in_array($site['region'] ?? null, ['all', 'eu', 'in'], true)
                    ? (string) $site['region']
                    : self::defaultRegion($host),
            ];
        }
        if ($this->sites === []) {
            $this->sites[] = ['host' => $this->primary, 'lang' => 'en', 'hreflang' => 'en', 'region' => 'all'];
        }
    }

    /**
     * @param array<string, mixed> $content complete site content (both languages)
     * @return array{status: int, html: string}
     */
    public function render(string $template, array $content, string $requestHost, string $path): array
    {
        $site = $this->siteFor($requestHost);
        $lang = $site['lang'];
        $path = '/' . ltrim((string) parse_url($path, PHP_URL_PATH), '/');
        $isHome = $path === '/' || $path === '/index.php';
        $base = 'https://' . $site['host'];

        $head = $this->head($content, $site, $base, $isHome);
        $body = $this->snapshot($content, $lang, $site['region'])
            . '<script id="jeebhar-content" type="application/json">'
            . self::json($content)
            . '</script>';

        $html = $template;
        $html = (string) preg_replace('/<html\b[^>]*>/i', '<html lang="' . $lang . '">', $html, 1);
        // Drop the static, English-only tags from index.html; ours replace them.
        $html = (string) preg_replace(
            '#\s*<(title)>.*?</title>|\s*<meta\s+(?:name="(?:description|twitter:[^"]*)"|property="og:[^"]*")[^>]*>#is',
            '',
            $html
        );
        $html = (string) preg_replace('#</head>#i', $head . "\n  </head>", $html, 1);
        $html = (string) preg_replace('#<div id="root">\s*</div>#i', '<div id="root">' . $body . '</div>', $html, 1);

        return ['status' => $isHome ? 200 : 404, 'html' => $html];
    }

    /** robots.txt for the requesting domain, pointing at its own sitemap. */
    public function robots(string $requestHost): string
    {
        $host = $this->siteFor($requestHost)['host'];
        return "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://$host/sitemap.xml\n";
    }

    /**
     * sitemap.xml listing the home page with all its language versions, so
     * search engines find jeebhar.de, .in and .com and how they relate.
     *
     * @param string $lastModified date of the last content change, Y-m-d
     */
    public function sitemap(string $requestHost, string $lastModified): string
    {
        $host = $this->siteFor($requestHost)['host'];
        $alternates = '';
        foreach ($this->sites as $site) {
            $alternates .= '    <xhtml:link rel="alternate" hreflang="' . self::e($site['hreflang'])
                . '" href="https://' . self::e($site['host']) . "/\" />\n";
        }
        $alternates .= '    <xhtml:link rel="alternate" hreflang="x-default" href="https://'
            . self::e($this->primary) . "/\" />\n";

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            . "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n"
            . "  <url>\n"
            . '    <loc>https://' . self::e($host) . "/</loc>\n"
            . '    <lastmod>' . self::e($lastModified) . "</lastmod>\n"
            . $alternates
            . "  </url>\n"
            . "</urlset>\n";
    }

    /** @return array{host: string, lang: string, hreflang: string, region: string} */
    public function siteFor(string $requestHost): array
    {
        $host = strtolower((string) preg_replace('/:\d+$/', '', $requestHost));
        $host = (string) preg_replace('/^www\./', '', $host);
        foreach ($this->sites as $site) {
            if ($site['host'] === $host) {
                return $site;
            }
        }
        // Unknown host (e.g. Bluehost's temporary domain): behave as the primary.
        foreach ($this->sites as $site) {
            if ($site['host'] === $this->primary) {
                return $site;
            }
        }
        return $this->sites[0];
    }

    /**
     * @param array<string, mixed> $content
     * @param array{host: string, lang: string, hreflang: string, region: string} $site
     */
    private function head(array $content, array $site, string $base, bool $isHome): string
    {
        $lang = $site['lang'];
        $brand = (string) ($content['brandName'] ?? 'Jeebhar');
        $title = self::pick($content['seoTitle'] ?? null, $lang) ?: $brand;
        $description = self::pick($content['seoDescription'] ?? null, $lang)
            ?: self::pick($content['heroSubheading'] ?? null, $lang);
        $canonical = $base . '/';
        $ogImage = 'https://' . $this->primary . '/brand/og-image.png';

        $tags = [
            '<title>' . self::e($title) . '</title>',
            '<meta name="description" content="' . self::e($description) . '" />',
        ];
        if (!$isHome) {
            $tags[] = '<meta name="robots" content="noindex" />';
        }
        $tags[] = '<link rel="canonical" href="' . self::e($canonical) . '" />';
        foreach ($this->sites as $alternate) {
            $tags[] = '<link rel="alternate" hreflang="' . self::e($alternate['hreflang'])
                . '" href="https://' . self::e($alternate['host']) . '/" />';
        }
        $tags[] = '<link rel="alternate" hreflang="x-default" href="https://' . self::e($this->primary) . '/" />';

        $og = [
            'og:type' => 'website',
            'og:site_name' => $brand,
            'og:title' => $title,
            'og:description' => $description,
            'og:url' => $canonical,
            'og:image' => $ogImage,
            'og:locale' => self::OG_LOCALE[$site['hreflang']] ?? self::OG_LOCALE[$lang],
        ];
        foreach ($og as $property => $value) {
            $tags[] = '<meta property="' . $property . '" content="' . self::e($value) . '" />';
        }
        $tags[] = '<meta name="twitter:card" content="summary_large_image" />';
        $tags[] = '<meta name="twitter:image" content="' . self::e($ogImage) . '" />';

        $hero = (string) ($content['heroImageUrl'] ?? '');
        if ($hero !== '') {
            // The hero photo is the largest thing on screen: fetch it with the page.
            $tags[] = '<link rel="preload" as="image" href="' . self::e($hero) . '" />';
        }

        $tags[] = '<script type="application/ld+json">'
            . self::json($this->structuredData($content, $site, $base, $title, $description, $ogImage))
            . '</script>';

        return "\n    " . implode("\n    ", $tags);
    }

    /**
     * schema.org description of the business, for Google's knowledge panel and
     * rich results.
     *
     * @param array<string, mixed> $content
     * @param array{host: string, lang: string, hreflang: string, region: string} $site
     * @return array<string, mixed>
     */
    private function structuredData(
        array $content,
        array $site,
        string $base,
        string $title,
        string $description,
        string $image
    ): array {
        $lang = $site['lang'];
        $contact = (array) ($content['contact'] ?? []);
        $orgId = 'https://' . $this->primary . '/#organization';

        $parts = array_map('trim', explode(',', (string) ($contact['address'] ?? '')));
        $address = array_filter([
            '@type' => 'PostalAddress',
            'addressLocality' => $parts[0] ?? '',
            'addressCountry' => count($parts) > 1 ? end($parts) : '',
        ]);

        $sameAs = array_values(array_filter(array_map(
            static fn (string $key): string => (string) ($contact[$key] ?? ''),
            ['instagramUrl', 'facebookUrl', 'youtubeUrl', 'tiktokUrl']
        )));

        $offers = [];
        foreach ((array) ($content['services'] ?? []) as $service) {
            $offers[] = [
                '@type' => 'Offer',
                'itemOffered' => array_filter([
                    '@type' => 'Service',
                    'name' => self::pick($service['title'] ?? null, $lang),
                    'description' => self::pick($service['shortDescription'] ?? null, $lang),
                ]),
            ];
        }

        $organization = array_filter([
            '@type' => 'ProfessionalService',
            '@id' => $orgId,
            'name' => (string) ($content['brandName'] ?? 'Jeebhar'),
            'url' => 'https://' . $this->primary . '/',
            'logo' => 'https://' . $this->primary . '/brand/jeebhar-logo@2x.png',
            'image' => $image,
            'description' => $description,
            'email' => (string) ($contact['email'] ?? ''),
            'telephone' => (string) ($contact['phone'] ?? ''),
            'address' => count($address) > 1 ? $address : null,
            'areaServed' => self::AREAS,
            'knowsAbout' => self::TOPICS,
            'sameAs' => $sameAs,
            'hasOfferCatalog' => $offers === [] ? null : [
                '@type' => 'OfferCatalog',
                'name' => self::LABELS[$lang]['services'],
                'itemListElement' => $offers,
            ],
        ], static fn ($value) => $value !== null && $value !== '' && $value !== []);

        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                $organization,
                [
                    '@type' => 'WebSite',
                    '@id' => $base . '/#website',
                    'url' => $base . '/',
                    'name' => $title,
                    'inLanguage' => $site['hreflang'],
                    'publisher' => ['@id' => $orgId],
                ],
            ],
        ];
    }

    /**
     * The page as plain semantic HTML. React swaps it for the full interface
     * on load, so it only needs to be correct and readable, not styled.
     *
     * Work and reels are limited to the domain's region (plus items tagged for
     * everywhere), matching what the app shows first on that domain, so
     * jeebhar.in is indexed with Indian work and jeebhar.de with European work.
     *
     * @param array<string, mixed> $content
     */
    private function snapshot(array $content, string $lang, string $region): string
    {
        $l = self::LABELS[$lang];
        $out = [];

        $out[] = '<main id="main">';
        $eyebrow = self::pick($content['heroEyebrow'] ?? null, $lang);
        if ($eyebrow !== '') {
            $out[] = '<p>' . self::e($eyebrow) . '</p>';
        }
        $out[] = '<h1>' . self::e(self::pick($content['heroHeading'] ?? null, $lang)) . '</h1>';
        $out[] = '<p>' . self::e(self::pick($content['heroSubheading'] ?? null, $lang)) . '</p>';
        $mediaKit = (string) ($content['mediaKitUrl'] ?? '');
        if ($mediaKit !== '') {
            $out[] = '<p><a href="' . self::e($mediaKit) . '">' . self::e($l['mediaKit']) . '</a></p>';
        }

        $out[] = self::section('services', $l['services'], array_map(
            static fn (array $s): string => '<h3>' . self::e(self::pick($s['title'] ?? null, $lang)) . '</h3><p>'
                . self::e(self::pick($s['longDescription'] ?? null, $lang)) . '</p>',
            (array) ($content['services'] ?? [])
        ));

        $out[] = self::section('experience', $l['experience'], array_map(
            static fn (array $m): string => '<strong>' . self::e((string) ($m['value'] ?? '')) . '</strong> '
                . self::e(self::pick($m['label'] ?? null, $lang)),
            (array) ($content['mediaKitMetrics'] ?? [])
        ));

        $out[] = self::section('work', $l['work'], array_map(
            static function (array $w) use ($lang): string {
                $title = self::pick($w['title'] ?? null, $lang);
                $image = (string) ($w['imageUrl'] ?? '');
                return '<h3>' . self::e($title) . '</h3>'
                    . ($image !== '' ? '<img src="' . self::e($image) . '" alt="' . self::e($title) . '" loading="lazy" width="400" height="300" />' : '')
                    . '<p>' . self::e(self::pick($w['description'] ?? null, $lang)) . '</p>';
            },
            self::inRegion((array) ($content['work'] ?? []), $region)
        ));

        foreach (['reels' => 'reels', 'travel' => 'travelReels'] as $id => $key) {
            $out[] = self::section($id, $l[$id], array_map(
                static fn (array $r): string => '<a href="' . self::e((string) ($r['instagramUrl'] ?? ''))
                    . '" rel="noopener">' . self::e(self::pick($r['title'] ?? null, $lang)) . '</a>',
                self::inRegion((array) ($content[$key] ?? []), $region)
            ));
        }

        $contact = (array) ($content['contact'] ?? []);
        $email = (string) ($contact['email'] ?? '');
        $phone = (string) ($contact['phone'] ?? '');
        $social = [];
        foreach (['instagramUrl' => 'Instagram', 'facebookUrl' => 'Facebook', 'youtubeUrl' => 'YouTube', 'tiktokUrl' => 'TikTok'] as $key => $name) {
            if (!empty($contact[$key])) {
                $social[] = '<a href="' . self::e((string) $contact[$key]) . '" rel="noopener">' . $name . '</a>';
            }
        }
        $out[] = '<section id="contact"><h2>' . self::e($l['contact']) . '</h2><address>'
            . self::e((string) ($contact['address'] ?? '')) . '<br />'
            . ($email !== '' ? '<a href="mailto:' . self::e($email) . '">' . self::e($email) . '</a><br />' : '')
            . ($phone !== '' ? '<a href="tel:' . self::e((string) preg_replace('/\s+/', '', $phone)) . '">' . self::e($phone) . '</a>' : '')
            . '</address>'
            . ($social !== [] ? '<p>' . self::e($l['follow']) . ': ' . implode(' · ', $social) . '</p>' : '')
            . '</section>';
        $out[] = '</main>';

        return implode('', $out);
    }

    /** @param array<int, string> $items */
    private static function section(string $id, string $heading, array $items): string
    {
        if ($items === []) {
            return '';
        }
        return '<section id="' . $id . '"><h2>' . self::e($heading) . '</h2><ul><li>'
            . implode('</li><li>', $items) . '</li></ul></section>';
    }

    /** One language from a { en, de } field; falls back to English, like the app. */
    private static function pick(mixed $text, string $lang): string
    {
        if (is_string($text)) {
            return trim($text);
        }
        if (!is_array($text)) {
            return '';
        }
        $value = trim((string) ($text[$lang] ?? ''));
        return $value !== '' ? $value : trim((string) ($text['en'] ?? ''));
    }

    /**
     * Same rule as client/src/region/regions.ts filterByRegion().
     *
     * @param array<int, array<string, mixed>> $items
     * @return array<int, array<string, mixed>>
     */
    private static function inRegion(array $items, string $region): array
    {
        if ($region === 'all') {
            return $items;
        }
        return array_values(array_filter(
            $items,
            static fn (array $item): bool => in_array($item['region'] ?? 'all', ['all', $region], true)
        ));
    }

    private static function defaultRegion(string $host): string
    {
        if (str_ends_with($host, '.de')) {
            return 'eu';
        }
        return str_ends_with($host, '.in') ? 'in' : 'all';
    }

    private static function defaultHreflang(string $host, string $lang): string
    {
        // jeebhar.in targets India: English for an Indian audience.
        if (str_ends_with($host, '.in') && $lang === 'en') {
            return 'en-IN';
        }
        return $lang;
    }

    private static function e(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /** JSON that is safe inside <script>: no "</script>", no HTML-significant characters. */
    private static function json(mixed $value): string
    {
        return (string) json_encode(
            $value,
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
        );
    }
}
