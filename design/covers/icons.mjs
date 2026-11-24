/**
 * Line-art illustrations for the generated covers, drawn on a 200 × 200 grid.
 *
 * `S` = the main stroke colour (cream), `A` = accent (orange), `C` = cyan.
 * Each icon is plain SVG markup so it can be edited by hand.
 */

const S = 'var(--ink)';
const A = 'var(--accent)';
const C = 'var(--cyan)';

const steam = (x, y) =>
  `<path d="M${x} ${y} c-8 -10 8 -16 0 -28" stroke="${C}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;

export const ICONS = {
  // ---------------------------------------------------------------- food
  noodles: `
    ${steam(78, 62)}${steam(100, 56)}${steam(122, 62)}
    <path d="M46 98h108" stroke="${S}"/>
    <path d="M50 98c4 34 26 52 50 52s46-18 50-52" stroke="${S}"/>
    <path d="M84 150h32" stroke="${S}"/>
    <path d="M60 98c6-14 16-14 22 0s16 14 22 0 16-14 22 0 14 14 20 0" stroke="${A}" stroke-width="6"/>
    <path d="M128 40 96 96M146 46l-36 50" stroke="${S}" stroke-width="6"/>
    <path d="M150 128c10 0 16 8 16 14H134c0-6 6-14 16-14z" fill="${A}" stroke="${S}" stroke-width="5"/>`,

  vadapav: `
    <path d="M44 96c0-30 25-46 56-46s56 16 56 46z" fill="${A}" fill-opacity=".92" stroke="${S}"/>
    <path d="M70 70l2 4M96 62l2 4M122 68l2 4" stroke="${S}" stroke-width="5"/>
    <ellipse cx="100" cy="110" rx="50" ry="13" fill="${A}" stroke="${S}"/>
    <path d="M52 104c10 6 20-2 30 4s20-2 30 4 20-2 30 4" stroke="${C}" stroke-width="5"/>
    <path d="M46 126h108c0 14-14 24-30 24H76c-16 0-30-10-30-24z" stroke="${S}"/>
    <path d="M156 58c14 4 20 18 14 34" stroke="${C}" stroke-width="6"/>
    <path d="M156 58c-2-6 0-10 4-12" stroke="${C}" stroke-width="5"/>`,

  thali: `
    <circle cx="100" cy="106" r="62" stroke="${S}"/>
    <circle cx="100" cy="106" r="52" stroke="${S}" stroke-width="3" opacity=".5"/>
    <circle cx="74" cy="84" r="15" fill="${A}" fill-opacity=".85" stroke="${S}" stroke-width="5"/>
    <circle cx="126" cy="84" r="15" fill="${C}" fill-opacity=".7" stroke="${S}" stroke-width="5"/>
    <circle cx="126" cy="128" r="15" fill="${A}" fill-opacity=".92" stroke="${S}" stroke-width="5"/>
    <path d="M62 120c6-6 22-6 28 0 0 12-6 18-14 18s-14-6-14-18z" fill="#f4e8d0" stroke="${S}" stroke-width="5"/>
    <path d="M150 40v40M160 40v40M170 40v40M150 64h20M160 80v40" stroke="${S}" stroke-width="5"/>`,

  momo: `
    <path d="M38 118h124l-8 34H46z" stroke="${S}"/>
    <path d="M38 118h124M52 134h96" stroke="${S}" stroke-width="4" opacity=".6"/>
    ${[66, 100, 134]
      .map(
        (x) => `
      <path d="M${x - 24} 116c0-26 12-40 24-44 12 4 24 18 24 44z" fill="#f4e8d0" fill-opacity=".92" stroke="${S}" stroke-width="6"/>
      <path d="M${x} 72v12M${x - 8} 76l4 10M${x + 8} 76l-4 10" stroke="${S}" stroke-width="4"/>`
      )
      .join('')}
    ${steam(80, 56)}${steam(120, 56)}
    <circle cx="160" cy="70" r="10" fill="${A}" stroke="${S}" stroke-width="4"/>`,

  fair: `
    <circle cx="100" cy="88" r="52" stroke="${S}"/>
    <circle cx="100" cy="88" r="8" fill="${A}" stroke="${S}" stroke-width="5"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const x = 100 + 52 * Math.cos(a);
      const y = 88 + 52 * Math.sin(a);
      return `<path d="M100 88L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${S}" stroke-width="4"/><rect x="${(x - 7).toFixed(1)}" y="${(y - 2).toFixed(1)}" width="14" height="12" rx="3" fill="${i % 2 ? A : C}" stroke="${S}" stroke-width="3"/>`;
    }).join('')}
    <path d="M100 88 72 162M100 88l28 74M60 162h80" stroke="${S}"/>
    <path d="M150 150c0-14 8-24 20-28 2 14-6 26-20 28zM150 150c4-8 10-14 16-18" stroke="${C}" stroke-width="5" fill="${C}" fill-opacity=".92"/>`,

  vegan: `
    <path d="M40 104h120c0 32-26 52-60 52s-60-20-60-52z" stroke="${S}"/>
    <path d="M64 104c-6-22 6-40 26-44-2 22-10 36-26 44z" fill="${C}" fill-opacity=".92" stroke="${S}" stroke-width="5"/>
    <path d="M92 104c0-28 18-46 44-48-2 26-18 44-44 48z" fill="${C}" fill-opacity=".7" stroke="${S}" stroke-width="5"/>
    <path d="M100 98l24-30M76 100l8-24" stroke="${S}" stroke-width="4"/>
    <circle cx="130" cy="94" r="9" fill="${A}" stroke="${S}" stroke-width="4"/>
    <circle cx="146" cy="100" r="6" fill="${A}" stroke="${S}" stroke-width="4"/>`,

  burger: `
    <path d="M30 92c0-26 20-40 46-40s46 14 46 40z" fill="${A}" fill-opacity=".92" stroke="${S}"/>
    <path d="M28 104c8 8 16-4 24 4s16-4 24 4 16-4 24 4 16-4 24 0" stroke="${C}" stroke-width="5"/>
    <rect x="30" y="112" width="92" height="14" rx="7" fill="${A}" stroke="${S}" stroke-width="5"/>
    <path d="M30 134h92c0 12-10 20-24 20H54c-14 0-24-8-24-20z" stroke="${S}"/>
    <path d="M156 34v130M150 164h12" stroke="${S}"/>
    <path d="M138 56h36l-6 72h-24z" fill="${A}" fill-opacity=".92" stroke="${S}" stroke-width="6"/>
    <path d="M142 76h28M144 96h24M146 116h20" stroke="${S}" stroke-width="4" opacity=".7"/>`,

  khinkali: `
    <path d="M30 156h140" stroke="${S}" stroke-width="5" opacity=".6"/>
    ${[
      [70, 1],
      [130, 0.86],
    ]
      .map(
        ([x, k]) => `
      <g transform="translate(${x} 150) scale(${k}) translate(-50 -110)">
        <path d="M50 40c-6 0-8 8-6 14-22 10-40 30-40 46 0 8 20 10 46 10s46-2 46-10c0-16-18-36-40-46 2-6 0-14-6-14z" fill="#F4ECDD" stroke="${S}" stroke-width="6"/>
        <path d="M44 54c-8 14-14 34-14 54M50 56v52M56 54c8 14 14 34 14 54M40 56c-14 12-24 28-26 48M60 56c14 12 24 28 26 48" stroke="#04202D" stroke-width="3" opacity=".45"/>
        <circle cx="50" cy="40" r="7" fill="${A}" stroke="${S}" stroke-width="4"/>
      </g>`
      )
      .join('')}
    <path d="M150 64c0-12 10-20 18-20 0 14-8 22-18 20z" fill="${C}" stroke="${S}" stroke-width="4"/>
    ${steam(70, 46)}`,

  // -------------------------------------------------------------- travel
  bed: `
    <path d="M30 150V60M170 150v-40M30 124h140" stroke="${S}"/>
    <rect x="44" y="92" width="34" height="20" rx="8" fill="${C}" fill-opacity=".92" stroke="${S}" stroke-width="5"/>
    <path d="M84 110v-12c0-6 4-10 10-10h56c12 0 20 8 20 20v4z" fill="${A}" fill-opacity=".92" stroke="${S}" stroke-width="6"/>
    <path d="M118 56c0-10 8-18 18-18 0 10-8 18-18 18z" fill="${A}" stroke="${S}" stroke-width="4"/>
    <path d="M128 46l6-6M150 30l4 4M158 48h6M142 24v-6" stroke="${C}" stroke-width="4"/>`,

  waffle: `
    <rect x="46" y="58" width="108" height="96" rx="18" fill="${A}" fill-opacity=".92" stroke="${S}"/>
    <path d="M46 90h108M46 122h108M82 58v96M118 58v96" stroke="${S}" stroke-width="5"/>
    <path d="M60 50c14-14 30 6 44-6s32 4 40-8" stroke="#f4e8d0" stroke-width="6"/>
    <circle cx="142" cy="44" r="10" fill="${C}" stroke="${S}" stroke-width="4"/>
    <path d="M30 166h140" stroke="${S}" stroke-width="5" opacity=".6"/>`,

  vegpin: `
    <path d="M100 166s-46-46-46-86a46 46 0 0 1 92 0c0 40-46 86-46 86z" fill="${A}" fill-opacity=".92" stroke="${S}"/>
    <path d="M80 96c-2-24 14-38 40-40-2 24-16 38-40 40z" fill="${C}" fill-opacity=".7" stroke="${S}" stroke-width="5"/>
    <path d="M84 92l26-26" stroke="${S}" stroke-width="4"/>
    <path d="M26 176c30-10 46 6 74-2s46-12 74 0" stroke="${C}" stroke-width="5" stroke-dasharray="2 12"/>`,

  wine: `
    <path d="M70 40h44c4 30-2 54-22 58-20-4-26-28-22-58z" stroke="${S}"/>
    <path d="M72 64h40c-2 18-8 30-20 32-12-2-18-14-20-32z" fill="${A}" fill-opacity=".7" stroke="none"/>
    <path d="M92 98v52M72 152h40" stroke="${S}"/>
    ${[
      [136, 82],
      [152, 82],
      [144, 96],
      [128, 96],
      [160, 96],
      [136, 110],
      [152, 110],
      [144, 124],
    ]
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="8" fill="${C}" fill-opacity=".92" stroke="${S}" stroke-width="4"/>`
      )
      .join('')}
    <path d="M144 74V60c6-6 14-6 18-2" stroke="${S}" stroke-width="4"/>
    <path d="M24 168c24-8 40 6 64 0s40-8 64 0 28 4 36 0" stroke="${C}" stroke-width="5"/>`,

  skyline: `
    <path d="M24 160h152" stroke="${S}"/>
    <path d="M38 160V104h20v56M64 160V70h22v90M92 160V44l14-10 14 10v116M126 160V84h20v76M152 160v-46h16v46" stroke="${S}" stroke-width="6"/>
    <path d="M100 60h12M100 76h12M100 92h12M70 88h10M70 104h10M132 100h8" stroke="${C}" stroke-width="4"/>
    <circle cx="150" cy="52" r="18" fill="${A}" fill-opacity=".92" stroke="${A}" stroke-width="6"/>
    <path d="M163 65l14 14" stroke="${A}" stroke-width="7"/>`,

  gondola: `
    <path d="M24 60c0-22 30-34 76-34s76 12 76 34" stroke="${S}"/>
    <path d="M24 60v14M176 60v14M60 34v40M140 34v40M100 26v48" stroke="${S}" stroke-width="5" opacity=".7"/>
    <path d="M30 126c40 18 100 18 140 0l6-10c-4 16-30 30-76 30s-72-14-76-30z" fill="${A}" fill-opacity=".92" stroke="${S}" stroke-width="6"/>
    <path d="M166 118l14-14M174 104l8 6" stroke="${S}" stroke-width="5"/>
    <path d="M132 64 96 150" stroke="${S}" stroke-width="5"/>
    <path d="M16 162c18-8 30 4 46-2s30-8 46 0 30 4 46-2 22-4 30 0" stroke="${C}" stroke-width="5"/>
    <path d="M30 178c18-6 30 4 46-2s30-6 46 0 30 4 46-2" stroke="${C}" stroke-width="4" opacity=".6"/>`,

  // --------------------------------------------------------------- brands
  hotel: `
    <path d="M48 166V46h104v120M30 166h140" stroke="${S}"/>
    ${[64, 92, 120]
      .flatMap((y) =>
        [64, 92, 120].map(
          (x) =>
            `<rect x="${x}" y="${y}" width="16" height="16" rx="3" fill="${(x + y) % 3 ? C : A}" fill-opacity=".92" stroke="${S}" stroke-width="4"/>`
        )
      )
      .join('')}
    <path d="M86 166v-22h28v22" stroke="${S}" stroke-width="6"/>
    <path d="M70 36l30-16 30 16" stroke="${A}" stroke-width="6"/>`,

  shaker: `
    <path d="M74 62h52l-6 100H80z" fill="${C}" fill-opacity=".92" stroke="${S}"/>
    <path d="M70 46h60v16H70zM88 30h24v16H88z" stroke="${S}" stroke-width="6"/>
    <path d="M77 100h46" stroke="${S}" stroke-width="4" opacity=".6"/>
    <path d="M78 104h44l-4 56H82z" fill="${A}" fill-opacity=".92" stroke="none"/>
    <path d="M138 120h34M144 108v24M166 108v24" stroke="${S}" stroke-width="7"/>`,

  pan: `
    <ellipse cx="86" cy="112" rx="58" ry="22" stroke="${S}"/>
    <path d="M28 112c2 22 26 38 58 38s56-16 58-38" stroke="${S}"/>
    <path d="M142 104l40-14" stroke="${S}" stroke-width="10"/>
    <path d="M42 112l10-6 10 6 10-6 10 6 10-6 10 6 10-6 10 6 10-6 10 6" stroke="${C}" stroke-width="3" opacity=".7"/>
    <circle cx="74" cy="110" r="12" fill="#f4e8d0" stroke="${S}" stroke-width="4"/>
    <circle cx="74" cy="110" r="5" fill="${A}" stroke="none"/>
    ${steam(70, 80)}${steam(104, 82)}`,

  bag: `
    <path d="M46 70h108l-8 96H54z" fill="${A}" fill-opacity=".92" stroke="${S}"/>
    <path d="M76 82V62a24 24 0 0 1 48 0v20" stroke="${S}"/>
    <path d="M150 46l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="${C}" stroke="none"/>
    <path d="M38 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="${C}" stroke="none"/>`,

  more: `
    <path d="M100 30l16 40 40 16-40 16-16 40-16-40-40-16 40-16z" fill="${A}" fill-opacity=".92" stroke="${S}" stroke-width="6"/>
    <path d="M156 122l7 17 17 7-17 7-7 17-7-17-17-7 17-7z" fill="${C}" fill-opacity=".92" stroke="${S}" stroke-width="4"/>
    <path d="M44 132l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" fill="${C}" fill-opacity=".92" stroke="${S}" stroke-width="4"/>`,
};
