import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings } from './types';

/**
 * HappyLeafy's API proxy (server/), which holds the Pl@ntNet and Gemini keys so testers
 * don't need their own. Configured at build time via .env:
 *   EXPO_PUBLIC_PROXY_URL=https://happyleafy-proxy.<you>.workers.dev
 *   EXPO_PUBLIC_APP_TOKEN=<same value as the worker's APP_TOKEN secret>
 * The app token ships inside the app, so it only deters casual misuse; the real protection
 * is the per-device daily caps on the server.
 */
const PROXY_URL = (process.env.EXPO_PUBLIC_PROXY_URL ?? '').replace(/\/+$/, '');
const APP_TOKEN = process.env.EXPO_PUBLIC_APP_TOKEN ?? '';
export const proxyEnabled = !!PROXY_URL && !!APP_TOKEN;

const DEVICE_KEY = 'happyleafy.deviceId.v1';
let deviceIdCache: string | undefined;

/** Random per-install id used only for the server's fair-use limits. */
export async function deviceId(): Promise<string> {
  if (deviceIdCache) return deviceIdCache;
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (!id) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    id = Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    await AsyncStorage.setItem(DEVICE_KEY, id);
  }
  deviceIdCache = id;
  return id;
}

export async function proxyFetch(path: string, init: RequestInit & { headers?: Record<string, string> }): Promise<Response> {
  return fetch(`${PROXY_URL}${path}`, {
    ...init,
    headers: { ...init.headers, 'X-App-Token': APP_TOKEN, 'X-Device-Id': await deviceId() },
  });
}

/** The proxy's own errors are { error: string, message: string }; upstream errors look different. */
export function proxyError(body: unknown): string | undefined {
  const b = body as { error?: unknown; message?: unknown } | null;
  return b && typeof b.error === 'string' && typeof b.message === 'string' ? b.message : undefined;
}

/** Identification / diagnosis available: the user's own key or the proxy. */
export const canUsePlantNet = (s: Settings) => !!s.plantNetApiKey || proxyEnabled;
/** AI features available: the user's own key or the proxy. */
export const canUseAi = (s: Settings) => !!s.geminiApiKey || proxyEnabled;
