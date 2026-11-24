#!/usr/bin/env node
/**
 * Renders the illustrated reel covers, brand cards and hero banner.
 *
 *   npx -y -p playwright@1 node design/covers/generate.mjs
 *   (first time also: npx playwright install chromium)
 *
 * Output (committed, served as-is):
 *   client/public/reels/<instagram-shortcode>.jpg   720 × 960  reel covers
 *   client/public/work/<name>.jpg                   960 × 720  brand cards
 *   client/public/brand/hero-banner.jpg            2400 × 1000 hero background
 *
 * These are placeholders with character. Swap any of them for a real photo
 * with "Upload…" in the content editor — no rebuild needed.
 */

import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { ICONS } from './icons.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC = resolve(ROOT, 'client/public');
const mark = `data:image/png;base64,${readFileSync(resolve(PUBLIC, 'brand/jeebhar-mark-light.png')).toString('base64')}`;

// Shortcodes match api/seed/default-content.json, in order.
const REELS = [
  ['DQWG611DCCr', 'food', 'noodles', 'Frankfurt'],
  ['DPqOeoIjLh_', 'food', 'vadapav', 'Stuttgart'],
  ['DYhR4-mM0BV', 'food', 'thali', 'Frankfurt'],
  ['Dbu8-CPgzk3', 'food', 'momo', 'Frankfurt'],
  ['DXPCTb4jF2x', 'food', 'fair', ''],
  ['DR4cFZFiAsH', 'food', 'vegan', 'Stuttgart'],
  ['DP3J4VADCvy', 'food', 'burger', 'Stuttgart'],
  ['DPLYUGoDJ9U', 'food', 'khinkali', ''],
  ['DaiErQFgKyc', 'travel', 'bed', ''],
  ['DTdFmqADE_Z', 'travel', 'waffle', ''],
  ['DRz0ai4jE-p', 'travel', 'vegpin', ''],
  ['DOQW7hWDOtA', 'travel', 'wine', 'Rüdesheim'],
  ['DNYF1KLsFEq', 'travel', 'skyline', 'Frankfurt'],
  ['DNFUxQyoo2F', 'travel', 'gondola', ''],
];

const BRANDS = [
  ['accor', 'hotel', 'Accor'],
  ['myprotein', 'shaker', 'Myprotein'],
  ['cookware', 'pan', 'HexClad · Stoneline'],
  ['temu', 'bag', 'Temu'],
  ['more', 'more', ''],
];

const THEME = {
  food: { glow: '247,115,47', glow2: '107,205,218' },
  travel: { glow: '107,205,218', glow2: '247,115,47' },
  brand: { glow: '118,206,187', glow2: '247,115,47' },
};

const base = (theme) => `
  :root { --ink:#F4ECDD; --accent:#F7732F; --cyan:#6BCDDA; }
  * { margin:0; box-sizing:border-box; }
  body { font-family: Inter, sans-serif; color: var(--ink); overflow:hidden;
    background:
      radial-gradient(circle at 78% 18%, rgba(${THEME[theme].glow},.38), transparent 46%),
      radial-gradient(circle at 12% 92%, rgba(${THEME[theme].glow2},.20), transparent 42%),
      linear-gradient(160deg, #0A5C7D 0%, #04202D 55%, #03131B 100%); }
  body::before { content:''; position:absolute; inset:0; opacity:.16;
    background-image: radial-gradient(rgba(255,255,255,.55) 1.2px, transparent 1.4px);
    background-size: 22px 22px; }
  svg.icon * { fill-rule: evenodd; }
  svg.icon { stroke-linecap:round; stroke-linejoin:round; stroke-width:7; fill:none;
    filter: drop-shadow(0 10px 30px rgba(0,0,0,.35)); }
  .mark { position:absolute; width:56px; height:56px; opacity:.95; }
  .pill { position:absolute; display:flex; align-items:center; gap:10px; padding:12px 22px;
    border-radius:999px; background:rgba(3,19,27,.55); border:1.5px solid rgba(244,236,221,.25);
    font-weight:700; letter-spacing:.02em; backdrop-filter: blur(6px); }
`;

const pin = `<svg width="22" height="22" viewBox="0 0 24 24" fill="#F7732F"><path d="M12 22s-7-6.6-7-12a7 7 0 0 1 14 0c0 5.4-7 12-7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>`;

const reelPage = (type, icon, place, index) => `<!doctype html><html><head><style>${base(type)}
  body { width:720px; height:960px; position:relative; }
  .icon { position:absolute; left:110px; top:190px; width:500px; height:500px; }
  .num { position:absolute; left:44px; top:40px; font-weight:800; font-size:30px; color:rgba(244,236,221,.55); letter-spacing:.06em; }
  .mark { right:40px; top:34px; }
  .pill { left:44px; bottom:48px; font-size:30px; }
  .band { position:absolute; left:0; right:0; bottom:0; height:220px;
    background: linear-gradient(to top, rgba(3,19,27,.7), transparent); }
</style></head><body>
  <div class="num">${String(index).padStart(2, '0')}</div>
  <img class="mark" src="${mark}">
  <svg class="icon" viewBox="0 0 200 200">${ICONS[icon]}</svg>
  <div class="band"></div>
  ${place ? `<div class="pill">${pin}${place}</div>` : ''}
</body></html>`;

const brandPage = (icon, name) => `<!doctype html><html><head><style>${base('brand')}
  body { width:960px; height:720px; position:relative; }
  .icon { position:absolute; left:${name ? 70 : 230}px; top:${name ? 150 : 110}px; width:${name ? 400 : 500}px; height:${name ? 400 : 500}px; }
  .name { position:absolute; left:470px; right:50px; top:0; bottom:0; display:flex; align-items:center;
    font-weight:800; font-size:${name.length > 12 ? 62 : 84}px; line-height:1.05; letter-spacing:-.02em; }
  .mark { right:40px; top:34px; }
</style></head><body>
  <img class="mark" src="${mark}">
  <svg class="icon" viewBox="0 0 200 200">${ICONS[icon]}</svg>
  ${name ? `<div class="name">${name}</div>` : ''}
</body></html>`;

/** Food + travel collage on the right; the left stays dark for the hero text. */
const bannerPage = () => {
  const spots = [
    ['noodles', 1560, 120, 300],
    ['gondola', 1990, 90, 270],
    ['momo', 1340, 520, 260],
    ['wine', 1800, 450, 300],
    ['vegan', 2140, 560, 250],
    ['skyline', 1150, 110, 240],
    ['waffle', 1610, 760, 200],
  ];
  return `<!doctype html><html><head><style>${base('food')}
  body { width:2400px; height:1000px; position:relative;
    background:
      radial-gradient(circle at 72% 30%, rgba(247,115,47,.34), transparent 38%),
      radial-gradient(circle at 88% 82%, rgba(107,205,218,.30), transparent 40%),
      linear-gradient(160deg, #0A5C7D 0%, #04202D 50%, #03131B 100%); }
  .spot { position:absolute; border-radius:50%; background: radial-gradient(circle, rgba(244,236,221,.10), transparent 70%); }
  .spot svg { width:100%; height:100%; }
  .route { position:absolute; inset:0; }
  .fade { position:absolute; inset:0; background: linear-gradient(90deg, #03131B 0%, rgba(3,19,27,.92) 30%, rgba(3,19,27,.35) 55%, transparent 75%); }
</style></head><body>
  <svg class="route" viewBox="0 0 2400 1000" fill="none">
    <path d="M900 860 C1150 700 1250 900 1450 700 S1750 300 1950 420 S2250 300 2360 160"
      stroke="#6BCDDA" stroke-width="6" stroke-dasharray="4 22" stroke-linecap="round" opacity=".8"/>
    ${[
      [1450, 700],
      [1950, 420],
      [2360, 160],
    ]
      .map(
        ([x, y]) =>
          `<g fill="#F7732F" transform="translate(${x - 24} ${y - 64}) scale(2)">${pin.replace(/<\/?svg[^>]*>/g, '')}</g>`
      )
      .join('')}
    <g transform="translate(1010 800) rotate(-26)" fill="#F4ECDD" opacity=".9">
      <path d="M0 0l90 8 40-34 14 4-22 40 54 6 16-14 10 2-10 26 4 26-10 2-12-16-54 2 16 42-14 4-36-36-90 4z"/>
    </g>
  </svg>
  ${spots
    .map(
      ([icon, x, y, size]) =>
        `<div class="spot" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px"><svg class="icon" viewBox="0 0 200 200">${ICONS[icon]}</svg></div>`
    )
    .join('')}
  <div class="fade"></div>
</body></html>`;
};

const browser = await chromium.launch();
const page = await browser.newPage();

const shoot = async (html, path, width, height) => {
  mkdirSync(dirname(path), { recursive: true });
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path, type: 'jpeg', quality: 84 });
  console.log('✔', path.slice(ROOT.length + 1));
};

for (const [index, [code, type, icon, place]] of REELS.entries()) {
  const number = type === 'food' ? index + 1 : index - 7;
  await shoot(reelPage(type, icon, place, number), resolve(PUBLIC, `reels/${code}.jpg`), 720, 960);
}
for (const [file, icon, name] of BRANDS) {
  await shoot(brandPage(icon, name), resolve(PUBLIC, `work/${file}.jpg`), 960, 720);
}
await shoot(bannerPage(), resolve(PUBLIC, 'brand/hero-banner.jpg'), 2400, 1000);

await browser.close();
