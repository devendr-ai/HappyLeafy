import { nextFertilizeDate, nextWaterDate, startOfDay } from './schedule';
import type { Plant, Settings } from './types';

/** Names list like "Monty, Fern and 2 more". */
function names(list: string[], max = 3): string {
  if (list.length <= max) return list.join(', ');
  return `${list.slice(0, max).join(', ')} and ${list.length - max} more`;
}

/** Title and body for one day's summary, or undefined when nothing is due. Pure, for testing. */
export function summaryFor(plants: Plant[], day: Date, hemisphere: Settings['hemisphere']): { title: string; body: string } | undefined {
  const end = startOfDay(day).getTime();
  const water = plants.filter((p) => nextWaterDate(p, { hemisphere }).getTime() <= end).map((p) => p.nickname);
  const feed = plants.filter((p) => nextFertilizeDate(p).getTime() <= end).map((p) => p.nickname);
  const count = new Set([...water, ...feed]).size;
  if (count === 0) return undefined;
  const title =
    count === 1
      ? `${water.length ? '💧' : '🌱'} ${water[0] ?? feed[0]} needs ${water.length && feed.length ? 'water and food' : water.length ? 'water' : 'food'} today`
      : `🌿 ${count} plants need care today`;
  const body = [water.length && `💧 Water: ${names(water)}`, feed.length && `🌱 Feed: ${names(feed)}`].filter(Boolean).join('  ·  ');
  return { title, body };
}
