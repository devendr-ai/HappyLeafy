import { EXTRA_CARE, nextExtraDate, nextFertilizeDate, nextWaterDate, startOfDay, type TaskKind } from './schedule';
import type { Plant, Settings } from './types';

/** Names list like "Monty, Fern and 2 more". */
function names(list: string[], max = 3): string {
  if (list.length <= max) return list.join(', ');
  return `${list.slice(0, max).join(', ')} and ${list.length - max} more`;
}

const LINE: Record<TaskKind, { emoji: string; label: string; noun: string }> = {
  water: { emoji: '💧', label: 'Check soil', noun: 'a soil check' },
  fertilize: { emoji: '🌱', label: 'Feed', noun: 'food' },
  mist: { emoji: '💦', label: 'Mist', noun: 'misting' },
  clean: { emoji: '✨', label: 'Wipe leaves', noun: 'a leaf wipe' },
  repot: { emoji: '🪴', label: 'Repot', noun: 'repotting' },
};
const ORDER: TaskKind[] = ['water', 'fertilize', ...EXTRA_CARE];

/** Title and body for one day's summary, or undefined when nothing is due. Pure, for testing. */
export function summaryFor(plants: Plant[], day: Date, hemisphere: Settings['hemisphere']): { title: string; body: string } | undefined {
  const end = startOfDay(day).getTime();
  const due = (p: Plant, kind: TaskKind) => {
    const d = kind === 'water' ? nextWaterDate(p, { hemisphere }) : kind === 'fertilize' ? nextFertilizeDate(p) : nextExtraDate(p, kind);
    return !!d && d.getTime() <= end;
  };
  const byKind = ORDER.map((kind) => ({ kind, who: plants.filter((p) => due(p, kind)).map((p) => p.nickname) })).filter((g) => g.who.length);
  const count = new Set(byKind.flatMap((g) => g.who)).size;
  if (count === 0) return undefined;

  let title: string;
  if (count === 1) {
    const nouns = byKind.map((g) => LINE[g.kind].noun);
    const need = nouns.length <= 2 ? nouns.join(' and ') : 'some care';
    title = `${LINE[byKind[0].kind].emoji} ${byKind[0].who[0]} needs ${need} today`;
  } else {
    title = `🌿 ${count} plants need care today`;
  }
  const body = byKind.map((g) => `${LINE[g.kind].emoji} ${LINE[g.kind].label}: ${names(g.who)}`).join('  ·  ');
  return { title, body };
}
