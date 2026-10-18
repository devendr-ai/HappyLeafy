import { File } from 'expo-file-system';
import { Platform } from 'react-native';

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

function checkKey(apiKey: string) {
  if (!apiKey) throw new Error('Add your free Pl@ntNet API key in Settings first.');
}

/** Shared error mapping for 401 / 429 / other failures. */
function throwForStatus(status: number, message?: string): never {
  if (status === 401) throw new Error('Pl@ntNet rejected the API key. Check it in Settings.');
  if (status === 403) throw new Error('Your Pl@ntNet plan does not include this feature.');
  if (status === 429) throw new Error('Daily identification limit reached. Try again tomorrow.');
  throw new Error(message ?? `Request failed (HTTP ${status}).`);
}

export async function identifyPlant(imageUri: string, apiKey: string, organ: Organ = 'auto'): Promise<IdentifyResult> {
  checkKey(apiKey);
  const form = await photoForm([{ uri: imageUri, organ }]);
  const url = `${API}/identify/all?api-key=${encodeURIComponent(apiKey)}&nb-results=5&lang=en&include-related-images=false`;
  const res = await fetch(url, { method: 'POST', body: form });
  const json = (await res.json().catch(() => ({}))) as ApiResponse;

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
  checkKey(apiKey);
  if (photos.length === 0 || photos.length > 5) throw new Error('Add between 1 and 5 photos.');
  const form = await photoForm(photos);
  const url = `${API}/diseases/identify?api-key=${encodeURIComponent(apiKey)}&nb-results=5&lang=en&include-related-images=false`;
  const res = await fetch(url, { method: 'POST', body: form });
  const json = (await res.json().catch(() => ({}))) as DiseaseResponse;

  if (res.status === 404) return { matches: [], remaining: json.remainingIdentificationRequests };
  if (!res.ok) throwForStatus(res.status, json.message);

  return {
    remaining: json.remainingIdentificationRequests,
    matches: (json.results ?? []).map((r) => ({ code: r.name, name: r.description || r.name, score: r.score })),
  };
}
