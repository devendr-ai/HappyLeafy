import type { Plant, Settings } from './types';

/**
 * Backup file format (pure, no I/O, so it is easy to test).
 * Photos are embedded as base64 and referenced from plants as "photo:<n>".
 * API keys are never written to a backup.
 */
export const BACKUP_VERSION = 1;
const REF = 'photo:';

export type BackupSettings = Omit<Settings, 'plantNetApiKey' | 'geminiApiKey'>;

export type BackupFile = {
  app: 'happyleafy';
  version: number;
  exportedAt: string;
  settings: BackupSettings;
  plants: Plant[];
  /** ref -> base64 JPEG */
  photos: Record<string, string>;
};

/** Every photo URI a set of plants uses (cover + timeline), de-duplicated. */
export function photoUris(plants: Plant[]): string[] {
  const all = plants.flatMap((p) => [p.photoUri, ...(p.timeline ?? []).map((e) => e.uri)]);
  return [...new Set(all.filter((u): u is string => !!u))];
}

/** Build the backup. `photoData` maps each photo URI to its base64 (missing ones are dropped). */
export function buildBackup(plants: Plant[], settings: Settings, photoData: Record<string, string>, now = new Date()): BackupFile {
  const refOf = new Map<string, string>();
  const photos: Record<string, string> = {};
  for (const uri of photoUris(plants)) {
    const data = photoData[uri];
    if (!data) continue;
    const ref = `${REF}${refOf.size}`;
    refOf.set(uri, ref);
    photos[ref] = data;
  }
  const swap = (uri?: string) => (uri ? refOf.get(uri) : undefined);
  const { plantNetApiKey: _p, geminiApiKey: _g, ...safeSettings } = settings;
  return {
    app: 'happyleafy',
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    settings: safeSettings,
    plants: plants.map(({ notificationIds: _n, ...p }) => ({
      ...p,
      photoUri: swap(p.photoUri),
      timeline: p.timeline?.map((e) => ({ ...e, uri: swap(e.uri) ?? '' })).filter((e) => e.uri),
    })),
    photos,
  };
}

/** Parse and validate a backup file's text. Throws a user-readable error if it is not a HappyLeafy backup. */
export function parseBackup(text: string): BackupFile {
  let raw: Partial<BackupFile>;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file is not a HappyLeafy backup.');
  }
  if (raw.app !== 'happyleafy' || !Array.isArray(raw.plants)) throw new Error('That file is not a HappyLeafy backup.');
  if ((raw.version ?? 0) > BACKUP_VERSION) throw new Error('This backup is from a newer version of HappyLeafy. Update the app first.');
  for (const p of raw.plants) {
    if (typeof p?.id !== 'string' || typeof p?.nickname !== 'string' || !Array.isArray(p?.history)) throw new Error('The backup is damaged (bad plant entry).');
  }
  return { ...(raw as BackupFile), photos: raw.photos ?? {}, settings: raw.settings ?? ({} as BackupSettings) };
}

/** Replace "photo:<n>" refs with real URIs (refs without a restored file are dropped). */
export function relinkPhotos(plants: Plant[], uriOf: Record<string, string>): Plant[] {
  const swap = (v?: string) => (v?.startsWith(REF) ? uriOf[v] : v);
  return plants.map((p) => ({
    ...p,
    photoUri: swap(p.photoUri),
    timeline: p.timeline?.map((e) => ({ ...e, uri: swap(e.uri) ?? '' })).filter((e) => e.uri),
  }));
}

/** Merge: keep current plants, add backup plants whose id is new. Replace: backup only. */
export function combinePlants(current: Plant[], restored: Plant[], mode: 'merge' | 'replace'): Plant[] {
  if (mode === 'replace') return restored;
  const have = new Set(current.map((p) => p.id));
  return [...current, ...restored.filter((p) => !have.has(p.id))];
}
