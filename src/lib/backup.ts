import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { buildBackup, parseBackup, photoUris, relinkPhotos, type BackupFile } from './backupFormat';
import type { Plant, Settings } from './types';

const fileName = () => `HappyLeafy-backup-${new Date().toISOString().slice(0, 10)}.json`;

async function readBase64(uri: string): Promise<string | undefined> {
  try {
    if (uri.startsWith('data:')) return uri.slice(uri.indexOf(',') + 1);
    if (Platform.OS === 'web') return undefined;
    const f = new File(uri);
    return f.exists ? await f.base64() : undefined;
  } catch {
    return undefined; // a missing photo should not block the backup
  }
}

/** Write a backup and open the share sheet (Save to Files → iCloud Drive, Google Drive, AirDrop…). Returns the plant/photo counts. */
export async function exportBackup(plants: Plant[], settings: Settings): Promise<{ plants: number; photos: number }> {
  const photoData: Record<string, string> = {};
  for (const uri of photoUris(plants)) {
    const data = await readBase64(uri);
    if (data) photoData[uri] = data;
  }
  const backup = buildBackup(plants, settings, photoData);
  const json = JSON.stringify(backup);
  const counts = { plants: backup.plants.length, photos: Object.keys(backup.photos).length };

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return counts;
  }

  const file = new File(Paths.cache, fileName());
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Save HappyLeafy backup' });
  return counts;
}

/** Let the user pick a backup file; returns it parsed and validated, or undefined if they cancelled. */
export async function pickBackup(): Promise<BackupFile | undefined> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true, base64: false });
  if (res.canceled || !res.assets?.[0]) return undefined;
  const asset = res.assets[0];
  const text = Platform.OS === 'web' ? await (asset.file ? asset.file.text() : (await fetch(asset.uri)).text()) : await new File(asset.uri).text();
  return parseBackup(text);
}

/** Write the backup's photos into app storage and return its plants with real photo URIs. */
export function restorePhotos(backup: BackupFile): Plant[] {
  const uriOf: Record<string, string> = {};
  if (Platform.OS === 'web') {
    for (const [ref, data] of Object.entries(backup.photos)) uriOf[ref] = `data:image/jpeg;base64,${data}`;
  } else {
    const dir = new Directory(Paths.document, 'plant-photos');
    dir.create({ idempotent: true, intermediates: true });
    const stamp = Date.now();
    for (const [ref, data] of Object.entries(backup.photos)) {
      const f = new File(dir, `restored-${stamp}-${ref.replace(/\W/g, '')}.jpg`);
      f.create();
      f.write(data, { encoding: 'base64' });
      uriOf[ref] = f.uri;
    }
  }
  return relinkPhotos(backup.plants, uriOf);
}
