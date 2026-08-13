# Brand assets

## Palette

Sampled directly from the logo artwork and declared once in `client/tailwind.config.ts`.

| Token        | Hex       | Use                                                             |
| ------------ | --------- | --------------------------------------------------------------- |
| `brand-700`  | `#00415E` | the logo's ink; text on light surfaces                          |
| `brand-cyan` | `#6BCDDA` | primary interactive colour — links, active nav, primary buttons |
| `brand-mint` | `#76CEBB` | success states, secondary accent                                |
| `accent`     | `#F7732F` | the map pin's orange — calls to action only                     |
| `brand-950`  | `#03131B` | page background                                                 |
| `brand-800`  | `#062F42` | card surfaces                                                   |
| `brand-100`  | `#CDE9EF` | body text on dark                                               |

Use the token, never the hex. A brand refresh should be a change to `tailwind.config.ts` alone.

`accent` is reserved for the primary action in a view. If two orange buttons are visible at once, one of them is wrong.

## Generated files

All in `client/public/`, produced from the two source PNGs. Total 280 kB, down from 2.5 MB of unoptimised source artwork.

| File                              | Size  | Purpose                                                                                |
| --------------------------------- | ----- | -------------------------------------------------------------------------------------- |
| `favicon.ico`                     | 19 kB | browser tabs, bookmarks — 16/24/32/48/64px in one file                                 |
| `favicon-16x16.png`               | 1 kB  | modern browsers                                                                        |
| `favicon-32x32.png`               | 1 kB  | modern browsers                                                                        |
| `favicon-48x48.png`               | 1 kB  | Windows shortcuts                                                                      |
| `apple-touch-icon.png`            | 24 kB | iOS home screen — **opaque**, since iOS ignores alpha and would otherwise render black |
| `icon-192.png`                    | 6 kB  | Android / PWA                                                                          |
| `icon-512.png`                    | 25 kB | PWA splash                                                                             |
| `icon-maskable-512.png`           | 13 kB | Android adaptive icons — mark inset to 66% for the safe zone                           |
| `site.webmanifest`                | —     | PWA metadata                                                                           |
| `brand/jeebhar-logo-light.png`    | 7 kB  | header and footer wordmark (reversed)                                                  |
| `brand/jeebhar-logo-light@2x.png` | 15 kB | retina                                                                                 |
| `brand/jeebhar-logo.png`          | 8 kB  | original wordmark, for light surfaces and print                                        |
| `brand/jeebhar-logo@2x.png`       | 19 kB | retina                                                                                 |
| `brand/jeebhar-mark-light.png`    | 16 kB | square mark (reversed) — loading screen, admin header                                  |
| `brand/jeebhar-mark.png`          | 25 kB | square mark, original                                                                  |
| `brand/og-image.png`              | 59 kB | 1200×630 link preview                                                                  |

## Why two tones

The logo's wordmark is `#00415E` — a deep teal that is close to unreadable on the site's near-black background. So the artwork exists in two tones:

- **`light`** (the default) — the dark ink is repainted `#EAF7FA` while the cyan, mint and orange are untouched. A standard reversed lockup. This is what the header, footer, loading screen and OG image use.
- **`dark`** — the original artwork, for white backgrounds, PDFs, decks and print.

## Using the logo

Never reference an artwork path directly. Always:

```tsx
<Logo />                                 // reversed wordmark, 40px tall — the site default
<Logo variant="mark" height={64} />      // square mark, reversed
<Logo tone="dark" />                     // original artwork, for a light surface
<Logo decorative />                      // aria-hidden, when the brand name is already announced
```

`Logo` sets explicit `width`/`height` from the artwork's intrinsic 1693 × 567 ratio, so it reserves layout space and never causes a cumulative-layout-shift penalty.

## Regenerating the icons

The generated files are committed, so a normal build needs nothing. Regenerate only when the source artwork changes:

```bash
python3 scripts/generate-brand-assets.py path/to/mark.png path/to/wordmark.png
```

The script trims transparent padding with an alpha threshold (the source PNGs carry faint noise that defeats a naive bounding box), squares the mark, emits every size above, builds the reversed tone by recolouring the dark ink, and palette-quantises the output — flat vector-style artwork needs nowhere near 24-bit colour.

## Media kit

The "Media Kit" nav item and hero button open `mediaKitUrl` from the content document, defaulting to `/brand/media-kit.pdf`. Drop your PDF at `client/public/brand/media-kit.pdf`, or point `mediaKitUrl` at a hosted file from `/#/admin`.
