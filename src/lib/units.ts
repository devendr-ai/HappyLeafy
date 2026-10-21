import type { Settings } from './types';

/** Measurement system for display. Everything is stored metric (ml, cm, °C, mm). */
export type Units = 'metric' | 'us';

/** Countries that use US customary units day to day. */
const US_REGIONS = new Set(['US', 'LR', 'MM', 'PR', 'GU', 'VI', 'AS', 'MP', 'UM']);

/** From the phone's region, e.g. en-US → us, en-GB → metric. */
export function regionUnits(locale = currentLocale()): Units {
  const region = locale.match(/[-_]([A-Z]{2})\b/)?.[1];
  return region && US_REGIONS.has(region) ? 'us' : 'metric';
}

function currentLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return 'en-US';
  }
}

/** The user's choice, else their region's. */
export const unitsOf = (s: Pick<Settings, 'units'>): Units => s.units ?? regionUnits();

const FRACTIONS: Record<number, string> = { 0: '', 1: '¼', 2: '½', 3: '¾' };

/** Nearest quarter: 1.25 → "1¼", 0.5 → "½". */
function quarters(n: number): string {
  const q = Math.max(1, Math.round(n * 4));
  const whole = Math.floor(q / 4);
  return `${whole || ''}${FRACTIONS[q % 4]}` || '0';
}

/** "1¼ cups" style (1 US cup ≈ 240 ml). */
export function cups(ml: number): string {
  const text = quarters(ml / 240);
  return `${text} ${Math.round((ml / 240) * 4) <= 4 ? 'cup' : 'cups'}`;
}

/** Short water amount: "500 ml" / "1.5 L", or "2 cups" in US units. */
export function formatWater(ml: number, u: Units): string {
  if (u === 'us') return cups(ml);
  return ml >= 1000 ? `${(ml / 1000).toFixed(ml % 1000 ? 1 : 0)} L` : `${ml} ml`;
}

/** Water amount with a secondary unit: "500 ml (2 cups)" / "2 cups (17 fl oz)". */
export function formatWaterLong(ml: number, u: Units): string {
  if (u === 'us') return `${cups(ml)} (${Math.round(ml / 29.57)} fl oz)`;
  return `${formatWater(ml, u)} (${cups(ml)})`;
}

const toF = (c: number) => Math.round((c * 9) / 5 + 32);

/** "18–29 °C" / "64–84 °F". */
export function formatTempRange([lo, hi]: [number, number], u: Units): string {
  return u === 'us' ? `${toF(lo)}–${toF(hi)} °F` : `${lo}–${hi} °C`;
}

/** Inches to the nearest half: 3 cm → "1", 1 cm → "½". */
const inches = (cm: number) => {
  const halves = Math.max(1, Math.round((cm / 2.54) * 2));
  return `${Math.floor(halves / 2) || ''}${halves % 2 ? '½' : ''}`;
};

/** Rain: "12 mm" / "0.5 in". */
export function formatRain(mm: number, u: Units): string {
  return u === 'us' ? `${(mm / 25.4).toFixed(mm < 25.4 ? 1 : 0)} in` : `${Math.round(mm)} mm`;
}

/** Pot width stepper in whole inches for US users; stored in cm. */
export const cmToInches = (cm: number) => Math.round(cm / 2.54);
export const inchesToCm = (inch: number) => Math.round(inch * 2.54);

/** Rewrite metric measurements inside care text, e.g. "top 2–3 cm" → "top 1 in", "18 °C" → "64 °F". */
export function localizeText(text: string, u: Units): string {
  if (u === 'metric') return text;
  return text
    .replace(/(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?\s*cm\b/g, (_, a: string, b?: string) => {
      const lo = inches(Number(a));
      const hi = b ? inches(Number(b)) : undefined;
      return hi && hi !== lo ? `${lo}–${hi} in` : `${lo} in`;
    })
    .replace(/(-?\d+(?:\.\d+)?)(?:\s*[–-]\s*(-?\d+(?:\.\d+)?))?\s*°\s*C\b/g, (_, a: string, b?: string) =>
      b ? `${toF(Number(a))}–${toF(Number(b))} °F` : `${toF(Number(a))} °F`,
    );
}
