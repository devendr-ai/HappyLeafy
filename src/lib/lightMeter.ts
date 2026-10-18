import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import type { Light } from './types';

export type LightReading = { lux: number; light: Light; label: string; advice: string };

/** EXIF values arrive as numbers, "1/60"-style strings, or arrays (ISO on iOS). */
function num(v: unknown): number | undefined {
  if (Array.isArray(v)) return num(v[0]);
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : undefined;
  if (typeof v === 'string') {
    const [a, b] = v.split('/').map(Number);
    const n = b ? a / b : a;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
  return undefined;
}

/**
 * Estimate illuminance from the camera's auto-exposure:
 * EV100 = log2(N² / t) − log2(ISO / 100); lux ≈ 2.5 · 2^EV100.
 * Rough (±1 stop), but good enough to tell low from bright light.
 */
export function luxFromExif(exif: Record<string, unknown>): number | undefined {
  const t = num(exif.ExposureTime);
  const n = num(exif.FNumber);
  const iso = num(exif.ISOSpeedRatings) ?? num(exif.PhotographicSensitivity);
  if (!t || !n || !iso) return undefined;
  const ev100 = Math.log2((n * n) / t) - Math.log2(iso / 100);
  return Math.round(2.5 * 2 ** ev100);
}

export function classify(lux: number): LightReading {
  if (lux < 500)
    return { lux, light: 'low', label: 'Very low light', advice: 'Too dark for most plants. Only the toughest (snake plant, ZZ, cast iron plant) will cope; consider a grow light.' };
  if (lux < 2500) return { lux, light: 'low', label: 'Low light', advice: 'Good for low-light plants like snake plant, ZZ, pothos and peace lily.' };
  if (lux < 10000) return { lux, light: 'medium', label: 'Medium light', advice: 'Suits most foliage plants: philodendron, calathea, ferns, peperomia.' };
  if (lux < 20000) return { lux, light: 'bright-indirect', label: 'Bright, indirect light', advice: 'Ideal for monstera, fiddle leaf fig, rubber plant and most houseplants.' };
  return { lux, light: 'direct', label: 'Direct sun', advice: 'Great for succulents, cacti, herbs and citrus. Can scorch shade lovers.' };
}

/** Take a throwaway photo where the plant sits and estimate the light there. */
export async function measureLight(): Promise<LightReading> {
  if (Platform.OS === 'web') throw new Error('The light meter needs the phone camera; open the app on your phone.');
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('Camera access is needed to measure light.');
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.1, exif: true });
  if (result.canceled || !result.assets?.[0]) throw new Error('cancelled');
  const lux = luxFromExif((result.assets[0].exif ?? {}) as Record<string, unknown>);
  if (lux === undefined) throw new Error("This phone didn't report exposure data, so light can't be measured.");
  return classify(lux);
}
