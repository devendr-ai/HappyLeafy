import { Platform } from 'react-native';
import type { Plant, RefPhoto } from './types';

/** The picture to show for a plant: the user's own photo, else a reference photo of the species. */
export function plantCover(p: Pick<Plant, 'photoUri' | 'refPhoto'>): string | undefined {
  return p.photoUri ?? p.refPhoto?.url ?? undefined;
}

type Summary = { type?: string; title?: string; thumbnail?: { source: string }; originalimage?: { width: number }; content_urls?: { mobile?: { page?: string } } };

/** Wikimedia only serves standard thumbnail widths; 500px is sharp enough for tiles and the plant page. */
function sharper(thumb: string, originalWidth = 0): string {
  const clean = thumb.split('?')[0];
  return originalWidth >= 500 ? clean.replace(/\/\d+px-([^/]+)$/, '/500px-$1') : clean;
}

/**
 * Stock reference photo from Wikipedia, tried by scientific name then common name.
 * Returns null when no article has a photo, undefined when offline (so it's tried again later).
 */
export async function findRefPhoto(names: (string | undefined)[]): Promise<RefPhoto | null | undefined> {
  const tried = new Set<string>();
  for (const name of names) {
    const title = name?.trim();
    if (!title || tried.has(title.toLowerCase())) continue;
    tried.add(title.toLowerCase());
    let res: Response;
    try {
      res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, {
        // Wikimedia asks apps to identify themselves; browsers send their own user agent.
        headers: Platform.OS === 'web' ? {} : { 'Api-User-Agent': 'HappyLeafy/1.0 (https://happyleafy.com; info@happyleafy.com)' },
      });
    } catch {
      return undefined;
    }
    if (!res.ok) continue;
    const j = (await res.json().catch(() => ({}))) as Summary;
    if (j.type === 'disambiguation' || !j.thumbnail?.source) continue;
    return { url: sharper(j.thumbnail.source, j.originalimage?.width), credit: 'Wikipedia', link: j.content_urls?.mobile?.page };
  }
  return null;
}
