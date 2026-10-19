import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/** Ask for a photo from camera or library; returns a resized JPEG uri (max 1280px wide). */
export async function pickPhoto(source: 'camera' | 'library'): Promise<string | undefined> {
  if (source === 'camera' && Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Enable camera access for HappyLeafy in Settings.');
      return undefined;
    }
  }
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (result.canceled || !result.assets?.[0]) return undefined;

  const asset = result.assets[0];
  const ctx = ImageManipulator.manipulate(asset.uri);
  // Browsers only give a site ~5 MB of storage, so web photos are kept smaller.
  const maxWidth = Platform.OS === 'web' ? 720 : 1280;
  if (asset.width > maxWidth) ctx.resize({ width: maxWidth, height: null });
  const rendered = await ctx.renderAsync();
  // On web, blob: URLs die on reload, so keep the photo inline as a data URI.
  const web = Platform.OS === 'web';
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: web ? 0.5 : 0.8, base64: web });
  return web && saved.base64 ? `data:image/jpeg;base64,${saved.base64}` : saved.uri;
}

/** Copy a temp/cache photo into permanent app storage so the OS cannot purge it. */
export function persistPhoto(uri: string): string {
  if (Platform.OS === 'web') return uri;
  const dir = new Directory(Paths.document, 'plant-photos');
  dir.create({ idempotent: true, intermediates: true });
  const src = new File(uri);
  const dest = new File(dir, `${Date.now()}-${src.name}`);
  src.copySync(dest);
  return dest.uri;
}

export function deletePhoto(uri?: string) {
  if (!uri || Platform.OS === 'web' || !uri.includes('plant-photos')) return;
  try {
    new File(uri).delete();
  } catch {
    // already gone
  }
}
