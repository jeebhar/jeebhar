import { useState } from 'react';

/**
 * VIEW — a card's cover image over a branded tile.
 *
 * The tile is always rendered as the base layer and the photo is laid over it.
 * That ordering is the whole point:
 *
 *   - Instagram does not expose reel covers to third parties, so a reel's cover
 *     is either self-hosted or absent.
 *   - Covers are lazy-loaded, so one below the fold has not attempted to load
 *     yet. Swapping to a fallback only `onError` would leave those cards as
 *     empty boxes until they scrolled into view, then pop.
 *   - Any remote photo can go stale, and a dead URL must not show the browser's
 *     broken-image icon.
 *
 * With the tile underneath, every one of those states looks designed, and
 * uploading a cover in the editor (or any image URL) makes it appear with no
 * code change.
 *
 * The tile is decorative (`aria-hidden`): the card's own heading already names
 * the item, so labelling it here would announce the title twice.
 */

interface MediaCoverProps {
  src: string;
  /** The image's alt text, and the text shown on the tile beneath. */
  title: string;
  /** Short label on the tile, e.g. "Food & ads". */
  badge?: string;
  /** Reels are portrait; work cards are landscape. */
  aspect?: 'portrait' | 'landscape';
  /**
   * Video covers (reels): the photo is softly blurred and dimmed, with a play
   * badge on top, so it reads as "a video" at a glance. Work photos stay sharp.
   */
  showPlayIcon?: boolean;
}

const ASPECT: Record<'portrait' | 'landscape', string> = {
  portrait: 'aspect-[9/12]',
  landscape: 'aspect-[4/3]',
};

export const MediaCover = ({
  src,
  title,
  badge,
  aspect = 'portrait',
  showPlayIcon = true,
}: MediaCoverProps) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative w-full overflow-hidden bg-brand-800 ${ASPECT[aspect]}`}>
      {/*
        Base layer: branded tile. Visible until a photo covers it.
        Deliberately carries no title — the card's own heading sits directly
        beneath this and would otherwise render the title twice.
      */}
      <div
        aria-hidden="true"
        data-testid="media-cover-tile"
        className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-cyan/20 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-accent/15 blur-2xl" />

        {badge && (
          <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-widest text-brand-100">
            {badge}
          </span>
        )}
      </div>

      {/* Photo layer, dropped entirely if it fails so nothing broken is shown. */}
      {src && !failed && (
        <img
          src={src}
          alt={title}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${
            showPlayIcon ? 'scale-105 blur-[2px] group-hover:blur-0' : ''
          } ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {showPlayIcon && (
        <>
          <div aria-hidden="true" className="absolute inset-0 bg-brand-950/25" />
          <span
            aria-hidden="true"
            data-testid="media-cover-play"
            className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-900 shadow-lg ring-4 ring-white/25 transition group-hover:scale-110 group-hover:bg-accent group-hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
              <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5z" />
            </svg>
          </span>
        </>
      )}
    </div>
  );
};
