import { Platform } from 'react-native';

/**
 * Pl@ntNet identification API. Free tier: 500 identifications/day for
 * non-commercial use. Get a key at https://my.plantnet.org (no card needed).
 */
const ENDPOINT = 'https://my-api.plantnet.org/v2/identify/all';

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

export async function identifyPlant(imageUri: string, apiKey: string, organ: Organ = 'auto'): Promise<IdentifyResult> {
  if (!apiKey) throw new Error('Add your free Pl@ntNet API key in Settings first.');

  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(imageUri)).blob();
    form.append('images', blob, 'plant.jpg');
  } else {
    // React Native's FormData accepts a { uri, name, type } file descriptor.
    form.append('images', { uri: imageUri, name: 'plant.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
  form.append('organs', organ);

  const url = `${ENDPOINT}?api-key=${encodeURIComponent(apiKey)}&nb-results=5&lang=en&include-related-images=false`;
  const res = await fetch(url, { method: 'POST', body: form });
  const json = (await res.json().catch(() => ({}))) as ApiResponse;

  if (res.status === 404) return { matches: [], remaining: json.remainingIdentificationRequests };
  if (res.status === 401) throw new Error('Pl@ntNet rejected the API key. Check it in Settings.');
  if (res.status === 429) throw new Error('Daily identification limit reached. Try again tomorrow.');
  if (!res.ok) throw new Error(json.message ?? `Identification failed (HTTP ${res.status}).`);

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
