# Reel cover images

Instagram does not expose reel cover images to third parties, so covers are
self-hosted here.

## How it works

Each reel's `thumbnailUrl` points at `/reels/<shortcode>.jpg`, where the
shortcode is the id in the reel's URL:

```
https://www.instagram.com/reel/DQWG611DCCr/
                               ^^^^^^^^^^^ shortcode
```

If the file is missing, the card renders a branded gradient tile with the reel
title and a play button instead of a broken image. **Drop a file in and the real
cover appears on the next page load — no code change and no redeploy of the
content.**

## Adding covers

1. Open the reel on Instagram, screenshot or export its cover frame.
2. Crop to **9:16 portrait** (the cards render at a 9:12 aspect and cover-crop).
3. Save as JPEG, roughly 720 × 1280, under ~200 kB.
4. Name it `<shortcode>.jpg` and save it in this folder.

Current expected filenames:

**Food and ads**

```
DQWG611DCCr.jpg  DPqOeoIjLh_.jpg  DYhR4-mM0BV.jpg  Dbu8-CPgzk3.jpg
DXPCTb4jF2x.jpg  DR4cFZFiAsH.jpg  DP3J4VADCvy.jpg  DPLYUGoDJ9U.jpg
```

**Travel**

```
DaiErQFgKyc.jpg  DTdFmqADE_Z.jpg  DRz0ai4jE-p.jpg
DOQW7hWDOtA.jpg  DNYF1KLsFEq.jpg  DNFUxQyoo2F.jpg
```

## Using a hosted image instead

A `thumbnailUrl` may also be an absolute `https://` URL, so a CDN or an image
host works too. Set it from `/#/admin` — no rebuild needed.

## Renaming the reels

The seeded titles ("Food reel 01" …) are placeholders. Rename them from
`/#/admin` to the campaign or client name; the cover filename is keyed to the
shortcode, so renaming a title never breaks an image.
