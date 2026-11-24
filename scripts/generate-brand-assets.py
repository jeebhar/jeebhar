#!/usr/bin/env python3
"""Generate every favicon, app icon and logo lockup from the source artwork.

    python3 scripts/generate-brand-assets.py <mark.png> <wordmark.png>

Writes into client/public/. The output is committed, so a normal build needs
nothing — run this only when the source artwork changes.

Requires Pillow and NumPy:  pip install pillow numpy
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Missing dependencies. Run: pip install pillow numpy")

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC = REPO_ROOT / "client" / "public"
BRAND = PUBLIC / "brand"

# Sampled from the artwork; keep in sync with client/tailwind.config.ts.
BRAND_DEEP = (0, 65, 94, 255)      # #00415E — the logo's ink
BRAND_LIGHT = (234, 247, 250)      # #EAF7FA — brand-50, the reversed ink
OG_BACKGROUND = (6, 35, 48, 255)   # the page background

# Flat, vector-style artwork: 64 palette entries is plenty and cuts file size
# by roughly 90% versus 24-bit PNG.
PALETTE_COLORS = 64

# The source PNGs carry faint near-transparent noise across the whole canvas,
# which defeats a naive getbbox(). Anything below this alpha is discarded.
ALPHA_THRESHOLD = 40


def load_trimmed(path: Path) -> Image.Image:
    """Load a PNG, drop near-transparent noise, and crop to the real content."""
    image = Image.open(path).convert("RGBA")
    pixels = np.array(image)
    pixels[..., 3] = np.where(pixels[..., 3] < ALPHA_THRESHOLD, 0, pixels[..., 3])
    image = Image.fromarray(pixels, "RGBA")

    box = image.getchannel("A").getbbox()
    if box is None:
        raise ValueError(f"{path} appears to be fully transparent.")
    return image.crop(box)


def squared(image: Image.Image) -> Image.Image:
    """Centre the image on a transparent square canvas."""
    width, height = image.size
    side = max(width, height)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(image, ((side - width) // 2, (side - height) // 2))
    return canvas


def reversed_tone(image: Image.Image) -> Image.Image:
    """Repaint the dark ink light, leaving cyan, mint and orange untouched.

    Produces the lockup used on the site's dark background, where the original
    #00415E wordmark is close to unreadable.
    """
    pixels = np.array(image).astype(np.int16)
    red, green, blue, alpha = (pixels[..., i] for i in range(4))

    is_dark_ink = (
        (alpha > 30) & (red < 110) & (green < 130) & (blue < 160) & (blue >= green - 30)
    )

    out = pixels.copy()
    for channel, value in enumerate(BRAND_LIGHT):
        out[..., channel] = np.where(is_dark_ink, value, out[..., channel])

    return Image.fromarray(out.astype(np.uint8), "RGBA")


def save_quantised(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.quantize(colors=PALETTE_COLORS, method=Image.FASTOCTREE, dither=Image.NONE).save(
        path, optimize=True
    )
    print(f"  {path.stat().st_size:>8,}  {path.relative_to(PUBLIC)}")


def save_resized(image: Image.Image, size: tuple[int, int], path: Path) -> None:
    save_quantised(image.resize(size, Image.LANCZOS), path)


def on_brand_background(mark: Image.Image, size: int, scale: float) -> Image.Image:
    """Composite the mark onto an opaque brand-coloured square."""
    canvas = Image.new("RGBA", (size, size), BRAND_DEEP)
    inner = mark.resize((int(size * scale),) * 2, Image.LANCZOS)
    offset = (size - inner.size[0]) // 2
    canvas.alpha_composite(inner, (offset, offset))
    return canvas


def main(mark_path: Path, wordmark_path: Path) -> None:
    mark = squared(load_trimmed(mark_path))
    wordmark = load_trimmed(wordmark_path)

    mark_light = squared(reversed_tone(mark))
    wordmark_light = reversed_tone(wordmark)

    print(f"mark {mark.size}   wordmark {wordmark.size}\n")
    print("Favicons and app icons:")

    for size in (16, 32, 48):
        save_resized(mark, (size, size), PUBLIC / f"favicon-{size}x{size}.png")

    for size, name in ((192, "icon-192.png"), (512, "icon-512.png")):
        save_resized(mark, (size, size), PUBLIC / name)

    # iOS ignores alpha, so this one must be opaque or it renders on black.
    apple = on_brand_background(mark, 180, 0.84).convert("RGB")
    apple.save(PUBLIC / "apple-touch-icon.png", optimize=True)
    print(f"  {(PUBLIC / 'apple-touch-icon.png').stat().st_size:>8,}  apple-touch-icon.png")

    # Android adaptive icons crop to a circle: inset to the 80% safe zone.
    save_quantised(on_brand_background(mark, 512, 0.66), PUBLIC / "icon-maskable-512.png")

    ico = PUBLIC / "favicon.ico"
    mark.resize((64, 64), Image.LANCZOS).save(
        ico, format="ICO", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)]
    )
    print(f"  {ico.stat().st_size:>8,}  favicon.ico")

    print("\nLogo lockups:")
    save_resized(mark, (512, 512), BRAND / "jeebhar-mark.png")
    save_resized(mark_light, (512, 512), BRAND / "jeebhar-mark-light.png")

    ratio = wordmark.size[1] / wordmark.size[0]
    for width, suffix in ((480, ""), (960, "@2x")):
        height = round(width * ratio)
        save_resized(wordmark, (width, height), BRAND / f"jeebhar-logo{suffix}.png")
        save_resized(wordmark_light, (width, height), BRAND / f"jeebhar-logo-light{suffix}.png")

    print("\nSocial preview:")
    card = Image.new("RGBA", (1200, 630), OG_BACKGROUND)
    logo_width = 700
    logo = wordmark_light.resize((logo_width, round(logo_width * ratio)), Image.LANCZOS)
    card.alpha_composite(logo, ((1200 - logo_width) // 2, (630 - logo.size[1]) // 2 - 20))
    og = BRAND / "og-image.png"
    card.convert("RGB").save(og, optimize=True)
    print(f"  {og.stat().st_size:>8,}  brand/og-image.png")

    total = sum(p.stat().st_size for p in PUBLIC.rglob("*.png")) + ico.stat().st_size
    print(f"\nTotal image payload: {total:,} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)

    main(Path(sys.argv[1]).expanduser(), Path(sys.argv[2]).expanduser())
