import { careForPlant, LIGHT_LABEL } from './careDb';
import { daysUntil, plantWaterInterval } from './schedule';
import type { Hemisphere, Plant } from './types';
import type { Units } from './units';

const ago = (iso?: string) => (iso ? `${-daysUntil(new Date(iso))} day(s) ago` : 'unknown');

/** Plain-text summary of a plant for AI prompts: identity, care guide, schedule, setup and recent history. */
export function describePlant(p: Plant, hemisphere: Hemisphere, units: Units = 'metric'): string {
  const care = careForPlant(p);
  const interval = plantWaterInterval(p, { hemisphere });
  const recent = p.history
    .slice(0, 6)
    .map((e) => `${e.type}${e.note ? ` (${e.note})` : ''} ${ago(e.at)}`)
    .join('; ');
  return [
    `Name: ${p.nickname}${p.commonName ? `, ${p.commonName}` : ''}${p.species ? ` (${p.species})` : ''}.`,
    care && `Care guide: ${LIGHT_LABEL[care.light]}, ${care.humidity} humidity, ${care.tempC[0]}–${care.tempC[1]} °C, soil: ${care.soil}.`,
    `Watering: every ${interval.days} days right now${interval.adjustments.length ? ` (${interval.adjustments.map((a) => a.hint).join('; ')})` : ''}; last watered ${ago(p.lastWatered)}.`,
    `Fertilising: every ${p.fertilizeEveryDays} days; last fed ${ago(p.lastFertilized)}.`,
    (p.potMaterial || p.potSize) && `Pot: ${[p.potSize, p.potMaterial].filter(Boolean).join(' ')}${p.drainage === false ? ', no drainage hole' : ''}.`,
    p.lightAtLocation && `Light where it sits: ${LIGHT_LABEL[p.lightAtLocation]}.`,
    p.location && `Location: ${p.location}.`,
    p.outdoor && 'Kept outdoors.',
    recent && `Recent care: ${recent}.`,
    p.savedAdvice?.length &&
      `Advice saved earlier: ${p.savedAdvice
        .slice(0, 2)
        .map((a) => `(${ago(a.at)}) "${a.question}": ${a.answer.slice(0, 220)}${a.answer.length > 220 ? '…' : ''}`)
        .join(' | ')}`,
    units === 'us' && 'The owner uses US units: give amounts in cups or fl oz, lengths in inches and temperatures in °F.',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Distinct rooms (the plant's location), alphabetical. */
export function roomsOf(plants: Plant[]): string[] {
  return [...new Set(plants.map((p) => p.location?.trim()).filter((r): r is string => !!r))].sort((a, b) => a.localeCompare(b));
}
