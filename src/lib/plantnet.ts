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

async function photoForm(imageUri: string, organ: Organ): Promise<FormData> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(imageUri)).blob();
    form.append('images', blob, 'plant.jpg');
  } else {
    // React Native's FormData accepts a { uri, name, type } file descriptor.
    form.append('images', { uri: imageUri, name: 'plant.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
  form.append('organs', organ);
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
  const form = await photoForm(imageUri, organ);
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

/** Pl@ntNet disease identification. Costs one identification from the same daily quota. */
export async function identifyDisease(imageUri: string, apiKey: string, organ: Organ = 'auto'): Promise<{ matches: DiseaseMatch[]; remaining?: number }> {
  checkKey(apiKey);
  const form = await photoForm(imageUri, organ);
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
