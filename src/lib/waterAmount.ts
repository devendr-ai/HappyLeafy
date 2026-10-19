import type { Plant, PotSize } from './types';

/** Typical inner diameters when only small / medium / large is known. */
const DIAMETER_CM: Record<PotSize, number> = { small: 10, medium: 15, large: 25 };

export type WaterAmount = { ml: number; cups: string; note?: string };

/** "1¼ cups" style, to the nearest quarter cup (1 cup ≈ 240 ml). */
function cups(ml: number): string {
  const q = Math.max(1, Math.round((ml / 240) * 4));
  const whole = Math.floor(q / 4);
  const frac = ['', '¼', '½', '¾'][q % 4];
  const n = `${whole || ''}${frac}` || '¼';
  return `${n} cup${q > 4 ? 's' : ''}`;
}

/**
 * How much water to give at each watering. Pot soil volume ≈ 0.75·π·d³/4 (a standard pot is
 * about as tall as it is wide, filled ~¾). A thorough watering is a share of that volume:
 * thirstier plants (short intervals) get more, desert plants less. No drainage hole: give less.
 * Undefined when the pot size is unknown.
 */
export function waterAmount(p: Pick<Plant, 'potDiameterCm' | 'potSize' | 'drainage' | 'waterEveryDays'>): WaterAmount | undefined {
  const d = p.potDiameterCm ?? (p.potSize ? DIAMETER_CM[p.potSize] : undefined);
  if (!d) return undefined;
  const soilMl = 0.75 * Math.PI * (d * d * d) / 4;
  const share = p.waterEveryDays <= 4 ? 0.3 : p.waterEveryDays <= 10 ? 0.25 : 0.2;
  let ml = soilMl * share;
  if (p.drainage === false) ml *= 0.6;
  const step = ml >= 1000 ? 100 : 50;
  ml = Math.max(50, Math.round(ml / step) * step);
  return {
    ml,
    cups: cups(ml),
    note: p.drainage === false ? 'No drainage hole: pour slowly and stop before water pools.' : 'Pour evenly until a little drains from the bottom; empty the saucer after.',
  };
}

export const formatMl = (ml: number) => (ml >= 1000 ? `${(ml / 1000).toFixed(ml % 1000 ? 1 : 0)} L` : `${ml} ml`);
