import { appConfig } from '../config/app.config';

/**
 * Resolves the media kit link.
 *
 * The API normalises its response, so this should always be set — but a link
 * whose href is `undefined` silently does nothing when clicked, with no error
 * anywhere to explain it. That failure is invisible and infuriating, so it is
 * guarded here rather than trusted.
 *
 * @param mediaKitUrl Value from the content document, possibly missing.
 */
export const resolveMediaKitUrl = (mediaKitUrl: string | undefined | null): string => {
  const trimmed = (mediaKitUrl ?? '').trim();
  return trimmed || appConfig.brand.mediaKitUrl;
};
