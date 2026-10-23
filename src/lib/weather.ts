import AsyncStorage from '@react-native-async-storage/async-storage';

/** Open-Meteo: free for non-commercial use, no API key. https://open-meteo.com */
const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search';
const CACHE_KEY = 'happyleafy.weather.v1';
const CACHE_HOURS = 3;

/** Rain at or above this (mm in a day) counts as a watering for outdoor plants. */
export const RAIN_MM = 5;

export type RainDay = { date: string; mm: number }; // date: YYYY-MM-DD, local to the place
export type Place = { name: string; latitude: number; longitude: number };

export async function searchPlaces(name: string): Promise<Place[]> {
  if (name.trim().length < 2) return [];
  const res = await fetch(`${GEOCODE}?name=${encodeURIComponent(name.trim())}&count=5&language=en&format=json`);
  if (!res.ok) throw new Error('Place search failed. Check your connection.');
  const json = (await res.json()) as { results?: { name: string; latitude: number; longitude: number; admin1?: string; country?: string }[] };
  return (json.results ?? []).map((r) => ({
    name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

type Cache = { at: number; latitude: number; longitude: number; days: RainDay[] };

/** Daily rain for the last 14 days and next 3, cached for a few hours. */
export async function getRain(latitude: number, longitude: number): Promise<RainDay[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const c = JSON.parse(raw) as Cache;
      if (c.latitude === latitude && c.longitude === longitude && Date.now() - c.at < CACHE_HOURS * 3600_000) return c.days;
    }
  } catch {
    // ignore a corrupt cache
  }
  const url = `${FORECAST}?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum&past_days=14&forecast_days=3&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather unavailable.');
  const json = (await res.json()) as { daily?: { time: string[]; precipitation_sum: (number | null)[] } };
  const days = (json.daily?.time ?? []).map((date, i) => ({ date, mm: json.daily?.precipitation_sum[i] ?? 0 }));
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), latitude, longitude, days } satisfies Cache));
  return days;
}

/** Local YYYY-MM-DD for a Date. */
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Most recent day up to today with enough rain, after `since` (YYYY-MM-DD); undefined if none. */
export function lastSoakingRain(days: RainDay[], since: string | undefined, today = ymd(new Date())): RainDay | undefined {
  return [...days].reverse().find((d) => d.date <= today && (!since || d.date > since) && d.mm >= RAIN_MM);
}

/** Rain expected tomorrow, if enough to skip watering. */
export function rainTomorrow(days: RainDay[], now = new Date()): RainDay | undefined {
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  const day = days.find((d) => d.date === ymd(t));
  return day && day.mm >= RAIN_MM ? day : undefined;
}

export type WeatherNow = { tempC: number; rainTomorrowMm: number };
let nowCache: { key: string; at: number; value: WeatherNow } | undefined;

/** Current temperature and tomorrow's rain for the Today header, cached for an hour. */
export async function getWeatherNow(latitude: number, longitude: number): Promise<WeatherNow> {
  const key = `${latitude},${longitude}`;
  if (nowCache && nowCache.key === key && Date.now() - nowCache.at < 3600_000) return nowCache.value;
  const url = `${FORECAST}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&daily=precipitation_sum&forecast_days=2&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather unavailable.');
  const json = (await res.json()) as { current?: { temperature_2m?: number }; daily?: { precipitation_sum?: (number | null)[] } };
  const value = { tempC: json.current?.temperature_2m ?? NaN, rainTomorrowMm: json.daily?.precipitation_sum?.[1] ?? 0 };
  nowCache = { key, at: Date.now(), value };
  return value;
}
