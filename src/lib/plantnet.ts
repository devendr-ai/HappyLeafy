import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { proxyEnabled, proxyError, proxyFetch } from './proxy';
import type { RefPhoto } from './types';

/**
 * Pl@ntNet identification API. Free tier: 500 identifications/day for
 * non-commercial use. Get a key at https://my.plantnet.org (no card needed).
 */
const API = 'https://my-api.plantnet.org/v2';

export type Organ = 'auto' | 'leaf' | 'flower' | 'fruit' | 'bark';

export type IdentifyMatch = {
  score: number;
  scientificName: string;
  commonNames: string[];
  genus: string;
  family: string;
  gbifId?: string;
  /** A reference photo of this species from Pl@ntNet, to compare with the user's plant. */
  refPhoto?: RefPhoto;
};

export type IdentifyResult = {
  matches: IdentifyMatch[];
  remaining?: number;
};

type ApiResponse = {
  results?: {
    score: number;
    species: {
      scientificNameWithoutAuthor: string;
      commonNames?: string[];
      genus?: { scientificNameWithoutAuthor: string };
      family?: { scientificNameWithoutAuthor: string };
    };
    gbif?: { id?: string };
    images?: { url?: { s?: string; m?: string }; citation?: string; author?: string }[];
  }[];
  remainingIdentificationRequests?: number;
  message?: string;
};

export type PhotoPart = { uri: string; organ: Organ };

/** Multipart body with one `images` + `organs` pair per photo (Pl@ntNet takes up to 5 of the same plant). */
async function photoForm(photos: PhotoPart[]): Promise<FormData> {
  const form = new FormData();
  for (const [i, { uri }] of photos.entries()) {
    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob();
      form.append('images', blob, `plant-${i}.jpg`);
    } else {
      // Expo's fetch rejects React Native's { uri, name, type } parts; it reads any
      // part with bytes(), name and type, which expo-file-system's File provides.
      form.append('images', new File(uri) as unknown as Blob);
    }
  }
  for (const { organ } of photos) form.append('organs', organ);
  return form;
}

/**
 * Send photos to Pl@ntNet: directly with the user's own key, otherwise through the HappyLeafy
 * proxy (which holds the key and applies fair-use limits). Returns the status and parsed body.
 */
async function send(route: 'identify' | 'diseases', form: FormData, apiKey: string): Promise<{ status: number; ok: boolean; json: Record<string, unknown> }> {
  let res: Response;
  if (apiKey) {
    const path = route === 'identify' ? 'identify/all' : 'diseases/identify';
    const images = route === 'identify'; // reference photos per match; diseases don't need them
    res = await fetch(`${API}/${path}?api-key=${encodeURIComponent(apiKey)}&nb-results=5&lang=en&include-related-images=${images}`, { method: 'POST', body: form });
  } else if (proxyEnabled) {
    res = await proxyFetch(`/v1/plantnet/${route}`, { method: 'POST', body: form });
  } else {
    throw new Error('Add your free Pl@ntNet API key in Settings first.');
  }
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!apiKey && !res.ok && res.status !== 404) {
    // Proxy's own limits/config errors carry a friendly message; key problems are the server's, not the user's.
    const own = proxyError(json);
    if (own) throw new Error(own);
    if (res.status === 401 || res.status === 403) throw new Error('Plant identification is unavailable right now. Please try later.');
  }
  return { status: res.status, ok: res.ok, json };
}

/** Shared error mapping for 401 / 429 / other failures. */
function throwForStatus(status: number, message?: string): never {
  if (status === 401) throw new Error('Pl@ntNet rejected the API key. Check it in Settings.');
  if (status === 403) throw new Error('Your Pl@ntNet plan does not include this feature.');
  if (status === 429) throw new Error('Daily identification limit reached. Try again tomorrow.');
  throw new Error(message ?? `Request failed (HTTP ${status}).`);
}

function refPhoto(img: NonNullable<NonNullable<ApiResponse['results']>[number]['images']>[number] | undefined): RefPhoto | undefined {
  const url = img?.url?.m ?? img?.url?.s;
  if (!url) return undefined;
  return { url, credit: img?.citation ?? (img?.author ? `${img.author} / Pl@ntNet` : 'Pl@ntNet') };
}

export async function identifyPlant(imageUri: string, apiKey: string, organ: Organ = 'auto'): Promise<IdentifyResult> {
  const res = await send('identify', await photoForm([{ uri: imageUri, organ }]), apiKey);
  const json = res.json as ApiResponse;

  if (res.status === 404) return { matches: [], remaining: json.remainingIdentificationRequests };
  if (!res.ok) throwForStatus(res.status, json.message);

  return {
    remaining: json.remainingIdentificationRequests,
    matches: (json.results ?? []).map((r) => ({
      score: r.score,
      scientificName: r.species.scientificNameWithoutAuthor,
      commonNames: r.species.commonNames ?? [],
      genus: r.species.genus?.scientificNameWithoutAuthor ?? r.species.scientificNameWithoutAuthor.split(' ')[0],
      family: r.species.family?.scientificNameWithoutAuthor ?? '',
      gbifId: r.gbif?.id,
      refPhoto: refPhoto(r.images?.[0]),
    })),
  };
}

export type DiseaseMatch = {
  /** EPPO code, e.g. "ERYSSP". */
  code: string;
  name: string;
  score: number;
};

type DiseaseResponse = {
  results?: { name: string; score: number; description?: string }[];
  remainingIdentificationRequests?: number;
  message?: string;
};

/** Pl@ntNet disease identification from 1–5 photos of one plant. Costs one identification per request. */
export async function identifyDisease(photos: PhotoPart[], apiKey: string): Promise<{ matches: DiseaseMatch[]; remaining?: number }> {
  if (photos.length === 0 || photos.length > 5) throw new Error('Add between 1 and 5 photos.');
  const res = await send('diseases', await photoForm(photos), apiKey);
  const json = res.json as DiseaseResponse;

  if (res.status === 404) return { matches: [], remaining: json.remainingIdentificationRequests };
  if (!res.ok) throwForStatus(res.status, json.message);

  return {
    remaining: json.remainingIdentificationRequests,
    matches: (json.results ?? []).map((r) => ({ code: r.name, name: r.description || r.name, score: r.score })),
  };
}
